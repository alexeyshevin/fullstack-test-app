import { createApp } from './app';

const PORT = Number(
  process.env.PORT ?? 3000,
);

const app = createApp();

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`,
  );

  console.log(
    `Swagger: http://localhost:${PORT}/api/docs`,
  );
});