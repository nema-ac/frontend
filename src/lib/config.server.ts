export const getServerConfig = () => {
  return {
    projectId: process.env.REOWN_PROJECT_ID || '',
  };
};
