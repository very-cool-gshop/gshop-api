import Anthropic from '@anthropic-ai/sdk';
import { parseImage } from '../utils/upload.js';
import AppError from '../utils/AppError.js';

const anthropic = new Anthropic();

const PRODUCT_SCHEMA = {
  type: 'object',
  properties: {
    name:        { type: 'string',  description: 'Product name in Traditional Chinese' },
    price:       { type: 'integer', description: 'Estimated retail price in TWD (no decimals)' },
    description: { type: 'string',  description: 'Brief product description in Traditional Chinese' },
  },
  required: ['name', 'price', 'description'],
  additionalProperties: false,
};

export const analyzeProductImage = async (req, res, next) => {
  try {
    await parseImage(req, res);
    if (!req.file) throw new AppError('No image uploaded', 400);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      output_config: {
        format: { type: 'json_schema', schema: PRODUCT_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: req.file.mimetype,
                data: req.file.buffer.toString('base64'),
              },
            },
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
