import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

export class OneSend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'onesend',
		name: 'oneSend',
		icon: 'file:onesend.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send transactional email through onesend (EU-sovereign delivery)',
		defaults: { name: 'onesend' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'oneSendApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Send Email', value: 'send', action: 'Send an email' },
				],
				default: 'send',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'supporters@wocoo.tv',
				description: 'Sender address. Its domain must be verified on your onesend account.',
				displayOptions: { show: { operation: ['send'] } },
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'user@example.com',
				description: 'Recipient address. For multiple, separate with commas.',
				displayOptions: { show: { operation: ['send'] } },
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['send'] } },
			},
			{
				displayName: 'HTML Body',
				name: 'html',
				type: 'string',
				typeOptions: { rows: 6 },
				default: '',
				description: 'HTML content. Provide HTML, text, or both.',
				displayOptions: { show: { operation: ['send'] } },
			},
			{
				displayName: 'Text Body',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'Plain-text fallback. Provide HTML, text, or both.',
				displayOptions: { show: { operation: ['send'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['send'] } },
				options: [
					{ displayName: 'CC', name: 'cc', type: 'string', default: '', description: 'Comma-separated.' },
					{ displayName: 'BCC', name: 'bcc', type: 'string', default: '', description: 'Comma-separated.' },
					{ displayName: 'Reply-To', name: 'reply_to', type: 'string', default: '' },
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('oneSendApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

		const splitList = (v: string): string[] =>
			v.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				if (operation !== 'send') {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
				}

				const from = this.getNodeParameter('from', i) as string;
				const to = splitList(this.getNodeParameter('to', i) as string);
				const subject = this.getNodeParameter('subject', i) as string;
				const html = this.getNodeParameter('html', i, '') as string;
				const text = this.getNodeParameter('text', i, '') as string;
				const extra = this.getNodeParameter('additionalFields', i, {}) as {
					cc?: string; bcc?: string; reply_to?: string;
				};

				if (!html && !text) {
					throw new NodeOperationError(this.getNode(), 'Provide an HTML body, a Text body, or both.', { itemIndex: i });
				}

				const body: Record<string, unknown> = { from, to, subject };
				if (html) body.html = html;
				if (text) body.text = text;
				if (extra.cc) body.cc = splitList(extra.cc);
				if (extra.bcc) body.bcc = splitList(extra.bcc);
				if (extra.reply_to) body.reply_to = extra.reply_to;

				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					uri: `${baseUrl}/v1/email/send`,
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this, 'oneSendApi', options,
				);

				returnData.push({ json: response, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
