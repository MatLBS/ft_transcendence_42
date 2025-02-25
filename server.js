// Import Fastify
import Fastify from 'fastify';


const app = Fastify({ logger: true })

// Define a simple route
app.get("/", (request, reply) => {
  return { message: "Hello, Mateo2!" };
});

// Start the server
const start = async () => {
  try {
    // Run the server on port 3000
    await app.listen({
      port: 3000,
      host: "0.0.0.0", // This allows connections from outside the container
    });
    console.log("Server is running on http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
