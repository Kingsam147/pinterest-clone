const { z } = require('zod');

const createBoardSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .default(''),
});

const updateBoardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(100, 'Title must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: 'At least one of title or description must be provided',
  });

module.exports = { createBoardSchema, updateBoardSchema };
