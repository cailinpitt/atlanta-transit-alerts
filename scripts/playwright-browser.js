import { chromium } from 'playwright';

export function launchChromium(options = {}) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  return chromium.launch({
    ...options,
    ...(executablePath ? { executablePath } : {}),
  });
}
