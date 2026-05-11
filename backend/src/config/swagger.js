const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Matchify+ API",
      version: "1.0.0",
      description:
        "API documentation for Matchify+ dating platform – MERN stack with real‑time chat, AI recommendations, and admin panel.",
      contact: {
        name: "Koushik Karmakar",
        email: "your-email@example.com",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://matchify-backend-fmre.onrender.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "Access token stored in HTTP‑only cookie (set after login/register).",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60f7c5c5e5b5c5c5c5c5c5c5" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: {
              type: "string",
              enum: ["user", "moderator", "admin", "superadmin"],
            },
            isVerified: { type: "boolean", example: false },
            age: { type: "number", example: 28, nullable: true },
            bio: {
              type: "string",
              example: "I love hiking and coffee.",
              nullable: true,
            },
            photos: {
              type: "array",
              items: { type: "string" },
              example: ["https://res.cloudinary.com/..."],
            },
            interests: {
              type: "array",
              items: { type: "string" },
              example: ["music", "travel"],
            },
            location: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["Point"] },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  minItems: 2,
                  maxItems: 2,
                },
              },
              nullable: true,
            },
            matchesCount: { type: "number", example: 3 },
            messagesCount: { type: "number", example: 42 },
            profileViews: { type: "number", example: 120 },
          },
        },
        Candidate: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            age: { type: "number" },
            photos: { type: "array", items: { type: "string" } },
            bio: { type: "string" },
            interests: { type: "array", items: { type: "string" } },
            distanceKm: { type: "number", nullable: true },
            isVerified: { type: "boolean" },
          },
        },
        SwipeResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            swipe: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["like", "pass"] },
              },
            },
            isMutual: { type: "boolean" },
            match: {
              type: "object",
              properties: {
                id: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
              nullable: true,
            },
          },
        },
        Match: {
          type: "object",
          properties: {
            matchId: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            matchedAt: { type: "string", format: "date-time" },
            lastMessageAt: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string" },
            matchId: { type: "string" },
            senderId: { type: "string" },
            type: { type: "string", enum: ["text", "voice", "gif"] },
            content: { type: "string" },
            readBy: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            deliveredAt: { type: "string", format: "date-time" },
          },
        },
        Report: {
          type: "object",
          properties: {
            _id: { type: "string" },
            reporterId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
              nullable: true,
            },
            reportedUserId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
              nullable: true,
            },
            reason: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "resolved", "dismissed"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuditLog: {
          type: "object",
          properties: {
            _id: { type: "string" },
            adminId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
              nullable: true,
            },
            action: { type: "string" },
            targetId: { type: "string" },
            details: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AdminStats: {
          type: "object",
          properties: {
            totalUsers: { type: "number" },
            blockedUsers: { type: "number" },
            pendingReports: { type: "number" },
            newUsersToday: { type: "number" },
          },
        },
        AnalyticsData: {
          type: "object",
          properties: {
            userGrowth: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  users: { type: "number" },
                },
              },
            },
            matchSuccess: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "number" },
                },
              },
            },
            roleDistribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "number" },
                  color: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // scan these files for JSDoc
};

const specs = swaggerJsdoc(options);
module.exports = specs;
