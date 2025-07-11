import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  scrollDown,
  selectRectangleArea,
  selectSnakeLayoutModeTool,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Snake mode copy&paste', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
  });

  test('Copy & paste selection with rectangular tool and undo', async ({
    page,
  }) => {
    const startX = 200;
    const startY = 200;
    const endX = 500;
    const endY = 400;

    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);

    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Copy & paste selection with Shift + Click and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Shift');
    await getMonomerLocator(page, Peptides.D).click();
    await getMonomerLocator(page, Peptides.F).first().click();
    await page.keyboard.up('Shift');
    await copyToClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });
});
