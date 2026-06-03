import Anthropic from '@anthropic-ai/sdk';
import { parseImage } from '../utils/upload.js';
import AppError from '../utils/AppError.js';
import { Category } from '../models/index.js';

const anthropic = new Anthropic();

const buildSchema = (categories) => ({
  type: 'object',
  properties: {
    name:        { type: 'string',  description: 'Product name in Traditional Chinese' },
    price:       { type: 'integer', description: 'Estimated retail price in TWD (no decimals)' },
    description: { type: 'string',  description: 'Brief product description in Traditional Chinese' },
    categoryId:  { type: 'integer', description: `Most suitable category ID from the list: ${categories.map(c => `${c.id}=${c.name}`).join(', ')}` },
  },
  required: ['name', 'price', 'description', 'categoryId'],
  additionalProperties: false,
});

export const analyzeProductImage = async (req, res, next) => {
  try {
    let imageSource;

    if (req.body?.url) {
      imageSource = { type: 'url', url: req.body.url };
    } else {
      await parseImage(req, res);
      if (!req.file) throw new AppError('No image uploaded or URL provided', 400);
      imageSource = { type: 'base64', media_type: req.file.mimetype, data: req.file.buffer.toString('base64') };
    }

    const categories = await Category.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      output_config: {
        format: { type: 'json_schema', schema: buildSchema(categories) },
      },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: imageSource },
            { type: 'text', text: '請分析這張商品圖片，用繁體中文回答，提供商品名稱、預估台幣售價（整數，無小數點）與簡短描述。' },
          ],
        },
      ],
    });

    res.json(JSON.parse(response.content[0].text));
  } catch (err) {
    next(err);
  }
};
