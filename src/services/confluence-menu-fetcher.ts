import axios from 'axios';
import { Menu, MenuFetchError, MealCategory } from '../types/menu';
import { BaseMenuFetcher } from './menu-fetcher';
import { config } from '../lib/config';
import OpenAI from 'openai';

interface ConfluenceAttachment {
  id: string;
  type: string;
  title: string;
  _links: {
    download: string;
  };
  extensions: {
    mediaType: string;
    fileSize: number;
  };
  metadata: {
    mediaType: string;
  };
}

interface ConfluenceAttachmentResponse {
  results: ConfluenceAttachment[];
}

export class ConfluenceMenuFetcher extends BaseMenuFetcher {
  private readonly baseUrl: string;
  private readonly auth: string;
  private readonly pageId: string;
  private readonly openai: OpenAI;

  constructor() {
    super('confluence');
    this.baseUrl = config.confluence.baseUrl;
    this.auth = config.confluence.auth;
    this.pageId = config.confluence.pageId;
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      //baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      baseURL: "https://openrouter.ai/api/v1"
    });
  }

  protected async fetchWeeklyMenuFromSource(): Promise<Menu[]> {
    // Step 1: Fetch attachments from Confluence
    const attachment = await this.getMostRecentAttachment();
    if (!attachment) {
      throw new MenuFetchError('No attachments found', undefined, false);
    }

    // Step 2: Download the attachment
    const imageBuffer = await this.downloadAttachment(attachment);
    const base64Image = imageBuffer.toString('base64');
    
    // Step 3: Use OpenAI to analyze the image and return structured menu data for the week
    const menus = await this.analyzeImageWithOpenAI(base64Image);
    
    if (menus.length === 0) {
      throw new MenuFetchError('No menu data available', undefined, false);
    }
    
    return menus;
  }

  private async getMostRecentAttachment(): Promise<ConfluenceAttachment | null> {
    try {
      const url = `${this.baseUrl}/rest/api/content/${this.pageId}/child/attachment`;
      console.log('Fetching attachments from:', url);
      console.log('Using auth token length:', this.auth.length);

      const response = await axios.get<ConfluenceAttachmentResponse>(
        url,
        {
          headers: {
            'Authorization': `Bearer ${this.auth}`
          }
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(response.headers, null, 2));

      if (!response.data) {
        console.error('No data in response');
        return null;
      }

      console.log('Response data:', JSON.stringify(response.data, null, 2));

      const attachments = response.data.results;
      if (!attachments?.length) {
        console.log('No attachments found');
        return null;
      }

      // Find the most recent attachment by comparing download URLs (they contain timestamps)
      return attachments.reduce((latest, current) => {
        const latestDate = new Date(latest._links.download.match(/modificationDate=(\d+)/)?.[1] || 0);
        const currentDate = new Date(current._links.download.match(/modificationDate=(\d+)/)?.[1] || 0);
        return currentDate > latestDate ? current : latest;
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new MenuFetchError('Failed to fetch attachments from Confluence', error as Error);
    }
  }

  private async downloadAttachment(attachment: ConfluenceAttachment): Promise<Buffer> {
    try {
      const downloadUrl = `${this.baseUrl}${attachment._links.download}`;
      console.log('Downloading attachment from:', downloadUrl);
      
      const response = await axios.get(
        downloadUrl,
        {
          headers: {
            'Authorization': `Bearer ${this.auth}`
          },
          responseType: 'arraybuffer',
          validateStatus: (status) => {
            console.log('Download response status:', status);
            return status >= 200 && status < 300;
          }
        }
      );

      console.log('Downloaded attachment size:', response.data.length, 'bytes');
      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Download error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseType: error.response?.headers?.['content-type']
        });
      }
      throw new MenuFetchError('Failed to download attachment', error as Error);
    }
  }

  private async analyzeImageWithOpenAI(base64Image: string): Promise<Menu[]> {
    try {
      console.log('Starting OpenAI image analysis');
      const response = await this.openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'This is a weekly lunch menu. Extract meals for each day with their categories. Return the structured data using the provided function.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'process_menu',
              description: 'Process the weekly menu data',
              parameters: {
                type: 'object',
                properties: {
                  weekday: {
                    type: 'string',
                    description: 'The weekday for these meals',
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                  },
                  meals: {
                    type: 'array',
                    items: {
                      type: 'string',
                      description: 'Name of the meal'
                    },
                    description: 'List of meals available for this weekday'
                  }
                },
                required: ['weekday', 'meals']
              }
            }
          }
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'process_menu' }
        }
      });

      console.log('OpenAI response:', JSON.stringify(response.choices[0], null, 2));
      const toolCalls = response.choices[0].message.tool_calls || [];
      if (!toolCalls.length) {
        throw new Error('No tool calls received');
      }

      // Get this week's Monday as reference
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1); // Set to Monday of this week
      
      // Process menus from different weekdays
      const menus: Menu[] = [];
      
      for (const call of toolCalls) {
        if (!call.function?.arguments) continue;
        
        const { weekday, meals } = JSON.parse(call.function.arguments);
        console.log('Processing menu data for:', weekday);
        
        // Calculate target date for this weekday
        const targetWeekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(weekday);
        const menuDate = new Date(monday);
        menuDate.setDate(monday.getDate() + targetWeekday);
        
        // Create menu for this weekday
        const dailyMenu: Menu = {
          date: menuDate,
          meals: meals.map((mealName: string) => ({
            name: mealName,
            category: MealCategory.MAIN
          })),
          metadata: {
            source: 'confluence',
            fetchedAt: new Date(),
            validUntil: new Date(menuDate.getTime() + 24 * 60 * 60 * 1000) // Valid until end of this day
          }
        };
        
        menus.push(dailyMenu);
      }
      
      if (menus.length === 0) {
        throw new Error('No valid menu data received from tool calls');
      }
      
      return menus;
    } catch (error: unknown) {
      console.error('OpenAI error:', error);
      throw new MenuFetchError('Failed to analyze image with OpenAI', error as Error);
    }
  }
}