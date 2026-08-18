import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OneSendApi implements ICredentialType {
	name = 'oneSendApi';
	displayName = 'onesend API';
	documentationUrl = 'https://onesend.eu';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key ID',
			name: 'apiKeyId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your onesend API Key ID (like an access key).',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your onesend API secret. Stored encrypted by n8n.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.onesend.eu',
			required: true,
			description: 'onesend API base URL. Change only for self-hosted instances.',
		},
	];

	// Inject Authorization: Bearer <keyid>:<secret> on every request
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKeyId}}:{{$credentials.apiSecret}}',
			},
		},
	};

	// "Test" button in the credential UI hits /health
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/health',
			method: 'GET',
		},
	};
}
