import { Page, test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

async function mouseMovement(page: Page, endPoint: { x: number; y: number }) {
  const startPoint = { x: 300, y: 300 };
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y);
}

test.describe('Hand tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Hand tool icon tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-4240
    const icon = {
      testId: 'hand',
      title: 'Hand tool (Ctrl+Alt+H)',
    };
    const iconButton = page
      .getByTestId(icon.testId)
      .filter({ has: page.locator(':visible') });
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
  });

  test('Moving canvas', async ({ page }) => {
    // Test case: EPMLSOPKET-4241
    // Verify if canvas is captured and move with Hand Tool
    await openFileAndAddToCanvas(page, 'KET/chain-with-atoms.ket');
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectHandTool();
    await mouseMovement(page, { x: 700, y: 300 });
    await takeEditorScreenshot(page);
  });

  test('Shortcut Ctrl+Alt+H/Cmd+H', async ({ page }) => {
    // Test case: EPMLSOPKET-4243
    // Verify if hot keys changed to Active Hand Tool cursor
    await openFileAndAddToCanvas(page, 'KET/chain-with-atoms.ket');
    await page.keyboard.press('Control+Alt+h');
    await mouseMovement(page, { x: 700, y: 300 });
    await takeEditorScreenshot(page);
  });

  test('The hand tool is not following the cursor when moving outside the canvas', async ({
    page,
  }) => {
    // test case: EPMLSOPKET-8937
    // Verify if hand is not following coursor outside the canvas
    const point = { x: 45, y: 148 };
    await CommonLeftToolbar(page).selectHandTool();
    await BottomToolbar(page).StructureLibrary();
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test('Able to scroll canvas down and to the right', async ({ page }) => {
    // Test case: EPMLSOPKET-8937
    // Verify posibility to move cnvas down and to the right
    await openFileAndAddToCanvas(page, 'KET/chain-with-atoms.ket');
    await CommonLeftToolbar(page).selectHandTool();
    await mouseMovement(page, { x: 300, y: 50 });
    await mouseMovement(page, { x: 60, y: 100 });
    await takeEditorScreenshot(page);
  });
});
