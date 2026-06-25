export interface paths {
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["config_api_health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/uploads/presigned-url/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Get Presigned Upload Url */
        post: operations["core_routers_file_uploads_get_presigned_upload_url"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/uploads/local/{file_upload_id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Local Upload */
        put: operations["core_routers_file_uploads_local_upload"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/uploads/local/{file_upload_id}/download/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Local Download */
        get: operations["core_routers_file_uploads_local_download"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/help-requests/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Help Requests */
        get: operations["core_routers_help_requests_list_help_requests"];
        put?: never;
        /** Create Help Request */
        post: operations["core_routers_help_requests_create_help_request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/help-requests/{help_request_id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Help Request */
        get: operations["core_routers_help_requests_get_help_request"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** PresignedUploadResponse */
        PresignedUploadResponse: {
            /** File Upload Id */
            file_upload_id: string;
            /** Upload Url */
            upload_url: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
        };
        /** ErrorResponseSchema */
        ErrorResponseSchema: {
            /** Error */
            error: string;
            /** Error Code */
            error_code?: string | null;
        };
        /** PresignedUploadRequest */
        PresignedUploadRequest: {
            /** Filename */
            filename: string;
            /** Content Type */
            content_type: string;
            /** Ttl Seconds */
            ttl_seconds: number;
        };
        /** HelpRequestResponse */
        HelpRequestResponse: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Latitude */
            latitude: string;
            /** Longitude */
            longitude: string;
            /** Severity */
            severity: string;
            /** Description */
            description: string;
            /** Contact Name */
            contact_name: string;
            /** Contact Phone */
            contact_phone: string;
            /** Contact Email */
            contact_email: string;
            /** Status */
            status: string;
            /** Attachment Ids */
            attachment_ids: string[];
            /**
             * Created
             * Format: date-time
             */
            created: string;
            /**
             * Modified
             * Format: date-time
             */
            modified: string;
        };
        /** HelpRequestCreate */
        HelpRequestCreate: {
            /** Latitude */
            latitude: number | string;
            /** Longitude */
            longitude: number | string;
            /** Severity */
            severity: string;
            /** Description */
            description: string;
            /**
             * Contact Name
             * @default
             */
            contact_name: string;
            /**
             * Contact Phone
             * @default
             */
            contact_phone: string;
            /**
             * Contact Email
             * @default
             */
            contact_email: string;
            /**
             * Attachment Ids
             * @default []
             */
            attachment_ids: string[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    config_api_health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    core_routers_file_uploads_get_presigned_upload_url: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PresignedUploadRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PresignedUploadResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_file_uploads_local_upload: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path: {
                file_upload_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_file_uploads_local_download: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path: {
                file_upload_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_help_requests_list_help_requests: {
        parameters: {
            query?: {
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HelpRequestResponse"][];
                };
            };
        };
    };
    core_routers_help_requests_create_help_request: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HelpRequestCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HelpRequestResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_help_requests_get_help_request: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                help_request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HelpRequestResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
}
