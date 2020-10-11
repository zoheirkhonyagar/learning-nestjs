interface IAppConfig {
  environment: string;
  databaseURL: string;
}

export default (): IAppConfig => ({
  environment: process.env.NODE_ENV || 'development',
  databaseURL: process.env.DATABASE_URL,
});
