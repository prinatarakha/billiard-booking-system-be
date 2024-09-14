export const log = (message: string) => {
  console.log(`I: ${new Date().toISOString()}: ${message}`);
}

export const logError = (message: string) => {
  console.error(`E: ${new Date().toISOString()}: ${message}`);
}