import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Netflix Clone API",
      version: "1.0.0",
      description: "API documentation for Netflix Clone",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current backend",
      },
    ],
  },
  apis: ["./backend/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
