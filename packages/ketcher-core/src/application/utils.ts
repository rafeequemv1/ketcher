import { Struct } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  FormatterFactory,
  SupportedFormat,
  identifyStructFormat,
} from './formatters';
import { Ketcher } from './ketcher';
import { ChemicalMimeType, StructService } from 'domain/services';
import { CoreEditor, EditorHistory } from './editor/internal';
import { KetSerializer } from 'domain/serializers';
import assert from 'assert';
import { EditorSelection } from './editor/editor.types';

class KetcherProvider {
  private ketcherInstances = new Map<string, Ketcher>();

  addKetcherInstance(instance: Ketcher) {
    this.ketcherInstances.set(instance.id, instance);
  }

  removeKetcherInstance(id) {
    this.ketcherInstances.delete(id);
  }

  getIndexById(id: string) {
    return Array.from(this.ketcherInstances.keys()).indexOf(id);
  }

  getKetcher(id?: string) {
    if (!id) {
      return [...this.ketcherInstances.values()][
        this.ketcherInstances.size - 1
      ];
    }

    const ketcher = this.ketcherInstances.get(id);

    if (!ketcher) {
      throw Error(`couldnt find ketcher instance ${id}`);
    }

    return ketcher;
  }
}

const ketcherProvider = new KetcherProvider();

export { ketcherProvider };

export function getStructure(
  ketcherId: string,
  structureFormat = SupportedFormat.rxn,
  formatterFactory: FormatterFactory,
  struct: Struct,
  drawingEntitiesManager?: DrawingEntitiesManager,
  selection?: EditorSelection,
): Promise<string> {
  const serverSettings =
    ketcherProvider.getKetcher(ketcherId).editor.serverSettings;
  const formatter = formatterFactory.create(structureFormat, serverSettings);
  const drawingEntitiesManagerCloningResult = drawingEntitiesManager?.mergeInto(
    new DrawingEntitiesManager(),
  );

  return formatter.getStructureFromStructAsync(
    struct,
    drawingEntitiesManagerCloningResult?.mergedDrawingEntities,
    selection,
  );
}

export async function prepareStructToRender(
  structStr: string,
  structService: StructService,
  ketcherInstance: Ketcher,
): Promise<Struct> {
  const struct: Struct = await parseStruct(
    structStr,
    structService,
    ketcherInstance,
  );
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.setImplicitHydrogen();
  struct.setStereoLabelsToAtoms();
  struct.markFragments();

  return struct;
}

export function parseStruct(
  structStr: string,
  structService: StructService,
  ketcherInstance: Ketcher,
) {
  const format = identifyStructFormat(structStr);
  const factory = new FormatterFactory(structService);
  const options = ketcherInstance.editor.options();

  const service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag,
  });
  return service.getStructureFromStringAsync(structStr);
}

export function deleteAllEntitiesOnCanvas() {
  const editor = CoreEditor.provideEditorInstance();
  const modelChanges = editor.drawingEntitiesManager.deleteAllEntities();
  editor.renderersContainer.update(modelChanges);
}

export async function parseAndAddMacromoleculesOnCanvas(
  struct: string,
  structService: StructService,
) {
  const editor = CoreEditor.provideEditorInstance();
  const ketSerializer = new KetSerializer();
  const format = identifyStructFormat(struct);
  let ketStruct = struct;
  if (format !== SupportedFormat.ket) {
    ketStruct = (
      await structService.convert({
        struct,
        output_format: ChemicalMimeType.KET,
      })
    ).struct;
  }

  const deserialisedKet = ketSerializer.deserializeToDrawingEntities(ketStruct);
  assert(deserialisedKet);
  const { command: modelChanges } =
    deserialisedKet.drawingEntitiesManager.mergeInto(
      editor.drawingEntitiesManager,
    );

  new EditorHistory(editor).update(modelChanges);
  editor.renderersContainer.update(modelChanges);
}
