const { z } = require('zod');

const PIN_CATEGORIES = [
  'Photography', 'Food', 'Travel', 'Tech', 'Fashion', 'Fitness',
  'Gardening', 'Automotive', 'Digital Nomad', 'Coffee', 'Art',
  'Music', 'Yoga', 'Architecture', 'Design', 'Lifestyle',
];

const createPinSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be at most 500 characters'),
  imageUrl: z
    .string({ required_error: 'Image URL is required' })
    .min(1, 'Image URL cannot be empty'),
  category: z.enum(PIN_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${PIN_CATEGORIES.join(', ')}` }),
  }),
  tags: z
    .array(z.string().trim().max(30, 'Each tag must be at most 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  boardId: z
    .string()
    .optional(),
});

const updatePinSchema = z
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
      .min(1, 'Description cannot be empty')
      .max(500, 'Description must be at most 500 characters')
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: 'At least one of title or description must be provided',
  });

module.exports = { createPinSchema, updatePinSchema };
