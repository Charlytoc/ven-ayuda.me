export interface paths {
    "/api/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Signup */
        post: operations["core_routers_auth_signup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: operations["core_routers_auth_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Current User */
        get: operations["core_routers_auth_get_current_user"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Patch Current User */
        patch: operations["core_routers_auth_patch_current_user"];
        trace?: never;
    };
    "/api/auth/organization": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Patch Active Organization */
        patch: operations["core_routers_auth_patch_active_organization"];
        trace?: never;
    };
    "/api/auth/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Settings */
        get: operations["core_routers_auth_get_user_settings"];
        /** Put User Settings */
        put: operations["core_routers_auth_put_user_settings"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout */
        post: operations["core_routers_auth_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["core_routers_agentic_chat_health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Conversation History */
        get: operations["core_routers_agentic_chat_get_conversation_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Conversations */
        get: operations["core_routers_agentic_chat_list_conversations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/conversations/{conversation_id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Archived Conversation History */
        get: operations["core_routers_agentic_chat_get_archived_conversation_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/conversation/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Clear Conversation */
        post: operations["core_routers_agentic_chat_clear_conversation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send Message */
        post: operations["core_routers_agentic_chat_send_message"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agentic-chat/runs/{celery_task_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Agentic Chat Run Status */
        get: operations["core_routers_agentic_chat_get_agentic_chat_run_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tasks/submit-batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit Task Batch */
        post: operations["core_routers_tasks_submit_task_batch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tasks/submit-speech": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit Speech */
        post: operations["core_routers_tasks_submit_speech"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Categories */
        get: operations["core_routers_vocabulary_list_categories"];
        put?: never;
        /** Create Category */
        post: operations["core_routers_vocabulary_create_category"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/categories/{category_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Category */
        delete: operations["core_routers_vocabulary_delete_category"];
        options?: never;
        head?: never;
        /** Update Category */
        patch: operations["core_routers_vocabulary_update_category"];
        trace?: never;
    };
    "/api/vocabulary/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Items */
        get: operations["core_routers_vocabulary_list_items"];
        put?: never;
        /** Create Item */
        post: operations["core_routers_vocabulary_create_item"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/items/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Item */
        get: operations["core_routers_vocabulary_get_item"];
        put?: never;
        post?: never;
        /** Delete Item */
        delete: operations["core_routers_vocabulary_delete_item"];
        options?: never;
        head?: never;
        /** Update Item */
        patch: operations["core_routers_vocabulary_update_item"];
        trace?: never;
    };
    "/api/vocabulary/items/{item_id}/phrases/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate Phrases */
        post: operations["core_routers_vocabulary_generate_phrases"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/items/{item_id}/phrases/save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Save Phrases
         * @description Merge generated phrases into item.extra.phrases (appends, deduplicates by meaning).
         */
        post: operations["core_routers_vocabulary_save_phrases"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/organize": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start Organize */
        post: operations["core_routers_vocabulary_start_organize"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/organize/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Organize Status */
        get: operations["core_routers_vocabulary_organize_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocabulary/organize/dismiss": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Dismiss Organize */
        post: operations["core_routers_vocabulary_dismiss_organize"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocab-qa/{item_id}/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send Message */
        post: operations["core_routers_vocab_qa_send_message"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocab-qa/{item_id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get History */
        get: operations["core_routers_vocab_qa_get_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/vocab-qa/{item_id}/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Clear Conversation */
        post: operations["core_routers_vocab_qa_clear_conversation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages/voices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Voices
         * @description Available TTS voices for the message-audio voice picker in settings.
         */
        get: operations["core_routers_messages_list_voices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages/voices/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview Voice
         * @description Synthesize a short sample clip so the user can hear a voice before saving it.
         */
        post: operations["core_routers_messages_preview_voice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages/{message_id}/audio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate Audio
         * @description Generate (or return cached) spoken audio for one assistant message.
         */
        post: operations["core_routers_messages_generate_audio"];
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
        /** AuthResponse */
        AuthResponse: {
            /** Api Token */
            api_token: string;
            user: components["schemas"]["UserResponse"];
            organization: components["schemas"]["OrganizationResponse"];
        };
        /** OrganizationResponse */
        OrganizationResponse: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Domain */
            domain: string;
            /** Status */
            status: string;
        };
        /** UserResponse */
        UserResponse: {
            /** Id */
            id: number;
            /** Email */
            email: string;
            /** First Name */
            first_name: string | null;
            /** Last Name */
            last_name: string | null;
            /** Organization */
            organization: {
                [key: string]: unknown;
            };
            /** Profile Picture */
            profile_picture: string | null;
            /** Is Active */
            is_active: boolean;
            /** Is Staff */
            is_staff: boolean;
            /** Created */
            created: string;
        };
        /** ErrorResponseSchema */
        ErrorResponseSchema: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** SignupRequest */
        SignupRequest: {
            /** Email */
            email: string;
            /** Password */
            password: string;
            /** First Name */
            first_name?: string | null;
            /** Last Name */
            last_name?: string | null;
        };
        /** LoginRequest */
        LoginRequest: {
            /** Email */
            email: string;
            /** Password */
            password: string;
        };
        /** UserUpdateRequest */
        UserUpdateRequest: {
            /** First Name */
            first_name: string;
            /** Last Name */
            last_name: string;
        };
        /** OrganizationUpdateRequest */
        OrganizationUpdateRequest: {
            /** Name */
            name?: string | null;
            /** Domain */
            domain?: string | null;
        };
        /** UserSettingsResponse */
        UserSettingsResponse: {
            /** Native Language */
            native_language: string;
            /** Extra */
            extra: {
                [key: string]: unknown;
            };
        };
        /** UserSettingsUpdateRequest */
        UserSettingsUpdateRequest: {
            /** Native Language */
            native_language: string;
            /** Extra */
            extra?: {
                [key: string]: unknown;
            } | null;
        };
        /** AgenticChatHistoryMessage */
        AgenticChatHistoryMessage: {
            /** Id */
            id: string;
            /** Role */
            role: string;
            /** Content */
            content: string;
            /**
             * Created
             * Format: date-time
             */
            created: string;
            /**
             * Assigned Tasks
             * @default []
             */
            assigned_tasks: components["schemas"]["TaskDisplaySchema"][];
            /**
             * Japanese Renders
             * @default []
             */
            japanese_renders: components["schemas"]["JapaneseRenderSchema"][];
            /**
             * Audio Segments
             * @default []
             */
            audio_segments: components["schemas"]["AudioSegmentSchema"][];
        };
        /** AgenticChatHistoryResponse */
        AgenticChatHistoryResponse: {
            /** Conversation Id */
            conversation_id: string | null;
            /** Title */
            title?: string | null;
            /** Summary */
            summary?: string | null;
            /** Messages */
            messages: components["schemas"]["AgenticChatHistoryMessage"][];
        };
        /** AudioSegmentSchema */
        AudioSegmentSchema: {
            /** Kind */
            kind: string;
            /** Media Id */
            media_id: string;
            /** Url */
            url: string;
            /** Voice */
            voice: string;
            /** Text */
            text: string;
        };
        /** AudioTurnDisplaySchema */
        AudioTurnDisplaySchema: {
            /**
             * Speaker Label
             * @default
             */
            speaker_label: string;
            /** Speaker Name */
            speaker_name?: string | null;
            /** Audio Url */
            audio_url?: string | null;
            /** Speaker */
            speaker?: string | null;
            /** Text */
            text?: string | null;
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /** Translation */
            translation?: string | null;
        };
        /** BuiltTokenDisplaySchema */
        BuiltTokenDisplaySchema: {
            /** Id */
            id: string;
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
        };
        /** ChoiceDisplaySchema */
        ChoiceDisplaySchema: {
            /** Text */
            text: string;
            /** Is Correct */
            is_correct?: boolean | null;
        };
        /** ConvCharacterDisplaySchema */
        ConvCharacterDisplaySchema: {
            /**
             * Slug
             * @default
             */
            slug: string;
            /**
             * Label
             * @default
             */
            label: string;
            /**
             * Name
             * @default
             */
            name: string;
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
        };
        /** DialogueTurnDisplaySchema */
        DialogueTurnDisplaySchema: {
            /** Speaker */
            speaker: string;
            /**
             * Is Blank
             * @default false
             */
            is_blank: boolean;
            /**
             * Text
             * @default
             */
            text: string;
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /**
             * Built Tokens
             * @default []
             */
            built_tokens: components["schemas"]["BuiltTokenDisplaySchema"][];
        };
        /** ExampleDisplaySchema */
        ExampleDisplaySchema: {
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /** Meaning */
            meaning: string;
        };
        /** JapaneseRenderSchema */
        JapaneseRenderSchema: {
            /** Segments */
            segments: components["schemas"]["JapaneseSegmentSchema"][];
            /**
             * Translation
             * @default
             */
            translation: string;
        };
        /** JapaneseSegmentSchema */
        JapaneseSegmentSchema: {
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
        };
        /** PhrasePartDisplaySchema */
        PhrasePartDisplaySchema: {
            /** Type */
            type: string;
            /**
             * Text
             * @default
             */
            text: string;
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /** Answer */
            answer?: string | null;
        };
        /** PoolTokenDisplaySchema */
        PoolTokenDisplaySchema: {
            /** Id */
            id: string;
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
        };
        /** SpeakerDisplaySchema */
        SpeakerDisplaySchema: {
            /**
             * Label
             * @default
             */
            label: string;
            /**
             * Name
             * @default
             */
            name: string;
        };
        /** StatementDisplaySchema */
        StatementDisplaySchema: {
            /** Id */
            id: string;
            /** Text */
            text: string;
            /** Is Correct */
            is_correct?: boolean | null;
        };
        /** TaskDisplaySchema */
        TaskDisplaySchema: {
            /** Id */
            id: string;
            /** Type */
            type: string;
            /** Status */
            status: string;
            /**
             * Choices
             * @default []
             */
            choices: components["schemas"]["ChoiceDisplaySchema"][];
            /**
             * Segments
             * @default []
             */
            segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /** Kanji */
            kanji?: string | null;
            /** Reading */
            reading?: string | null;
            /**
             * Onyomi
             * @default []
             */
            onyomi: string[];
            /**
             * Kunyomi
             * @default []
             */
            kunyomi: string[];
            /** Meaning */
            meaning?: string | null;
            /** Explanation */
            explanation?: string | null;
            /**
             * Examples
             * @default []
             */
            examples: components["schemas"]["ExampleDisplaySchema"][];
            /**
             * Parts
             * @default []
             */
            parts: components["schemas"]["PhrasePartDisplaySchema"][];
            /**
             * Tokens
             * @default []
             */
            tokens: string[];
            /**
             * Correct Order
             * @default []
             */
            correct_order: string[];
            /** Mode */
            mode?: string | null;
            /**
             * Turns
             * @default []
             */
            turns: components["schemas"]["DialogueTurnDisplaySchema"][];
            /**
             * Pool
             * @default []
             */
            pool: components["schemas"]["PoolTokenDisplaySchema"][];
            /**
             * Correct Solutions
             * @default []
             */
            correct_solutions: string[][];
            /** Image Url */
            image_url?: string | null;
            /** Character */
            character?: string | null;
            /** Prompt */
            prompt?: string | null;
            /** Show Character */
            show_character?: boolean | null;
            /** Scenario */
            scenario?: string | null;
            /**
             * Speakers
             * @default []
             */
            speakers: components["schemas"]["SpeakerDisplaySchema"][];
            /**
             * Characters
             * @default []
             */
            characters: components["schemas"]["ConvCharacterDisplaySchema"][];
            /**
             * Audio Turns
             * @default []
             */
            audio_turns: components["schemas"]["AudioTurnDisplaySchema"][];
            /**
             * Statements
             * @default []
             */
            statements: components["schemas"]["StatementDisplaySchema"][];
            /**
             * Correct Statement Ids
             * @default []
             */
            correct_statement_ids: string[];
            /** Prompt Audio Url */
            prompt_audio_url?: string | null;
            /** Prompt Translation */
            prompt_translation?: string | null;
            /**
             * Expected Elements
             * @default []
             */
            expected_elements: string[];
            /** Example Answer */
            example_answer?: string | null;
            /**
             * Example Segments
             * @default []
             */
            example_segments: components["schemas"]["TextSegmentDisplaySchema"][];
            /** Result */
            result?: {
                [key: string]: unknown;
            } | null;
            /** Is Correct */
            is_correct?: boolean | null;
        };
        /** TextSegmentDisplaySchema */
        TextSegmentDisplaySchema: {
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
            /**
             * Is Target
             * @default false
             */
            is_target: boolean;
        };
        /** AgenticChatErrorResponse */
        AgenticChatErrorResponse: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** AgenticChatConversationListResponse */
        AgenticChatConversationListResponse: {
            /** Conversations */
            conversations: components["schemas"]["AgenticChatConversationSummary"][];
        };
        /** AgenticChatConversationSummary */
        AgenticChatConversationSummary: {
            /** Id */
            id: string;
            /** Title */
            title: string;
            /** Summary */
            summary?: string | null;
            /** Status */
            status: string;
            /** Message Count */
            message_count: number;
            /** Last Interaction At */
            last_interaction_at: string | null;
            /** Closed At */
            closed_at: string | null;
            /**
             * Created
             * Format: date-time
             */
            created: string;
        };
        /** AgenticChatClearResponse */
        AgenticChatClearResponse: {
            /** Status */
            status: string;
            /** Had Active Conversation */
            had_active_conversation: boolean;
        };
        /** AgenticChatMessageResponse */
        AgenticChatMessageResponse: {
            /** Status */
            status: string;
            /** Conversation Id */
            conversation_id: string;
            /** Message Id */
            message_id: string;
            /** Celery Task Id */
            celery_task_id: string;
        };
        /** AgenticChatMessageRequest */
        AgenticChatMessageRequest: {
            /** Message */
            message: string;
        };
        /** AgenticChatRunStatusResponse */
        AgenticChatRunStatusResponse: {
            /** Status */
            status: string;
            /** Error */
            error?: string | null;
        };
        /** BatchChoiceResult */
        BatchChoiceResult: {
            /** Text */
            text: string;
            /** Is Correct */
            is_correct: boolean;
        };
        /** TaskBatchResult */
        TaskBatchResult: {
            /** Task Id */
            task_id: string;
            /** Correct */
            correct: boolean;
            /**
             * Result
             * @default {}
             */
            result: {
                [key: string]: unknown;
            };
            /**
             * Choices
             * @default []
             */
            choices: components["schemas"]["BatchChoiceResult"][];
            /**
             * Examples
             * @default []
             */
            examples: {
                [key: string]: unknown;
            }[];
            /** Explanation */
            explanation?: string | null;
            /**
             * Parts
             * @default []
             */
            parts: {
                [key: string]: unknown;
            }[];
            /**
             * Tokens
             * @default []
             */
            tokens: string[];
            /**
             * Correct Order
             * @default []
             */
            correct_order: string[];
            /** Meaning */
            meaning?: string | null;
            /**
             * Segments
             * @default []
             */
            segments: {
                [key: string]: unknown;
            }[];
            /** Mode */
            mode?: string | null;
            /**
             * Turns
             * @default []
             */
            turns: {
                [key: string]: unknown;
            }[];
            /**
             * Pool
             * @default []
             */
            pool: {
                [key: string]: unknown;
            }[];
            /**
             * Correct Solutions
             * @default []
             */
            correct_solutions: string[][];
            /** Image Url */
            image_url?: string | null;
            /** Character */
            character?: string | null;
            /** Prompt */
            prompt?: string | null;
            /** Reading */
            reading?: string | null;
            /** Scenario */
            scenario?: string | null;
            /**
             * Speakers
             * @default []
             */
            speakers: {
                [key: string]: unknown;
            }[];
            /**
             * Characters
             * @default []
             */
            characters: {
                [key: string]: unknown;
            }[];
            /**
             * Audio Turns
             * @default []
             */
            audio_turns: {
                [key: string]: unknown;
            }[];
            /**
             * Statements
             * @default []
             */
            statements: {
                [key: string]: unknown;
            }[];
            /**
             * Correct Statement Ids
             * @default []
             */
            correct_statement_ids: string[];
            /** Prompt Audio Url */
            prompt_audio_url?: string | null;
            /** Prompt Translation */
            prompt_translation?: string | null;
            /**
             * Expected Elements
             * @default []
             */
            expected_elements: string[];
            /** Example Answer */
            example_answer?: string | null;
            /**
             * Example Segments
             * @default []
             */
            example_segments: {
                [key: string]: unknown;
            }[];
        };
        /** TaskBatchSubmitResponse */
        TaskBatchSubmitResponse: {
            /** Results */
            results: components["schemas"]["TaskBatchResult"][];
        };
        /** TaskErrorResponse */
        TaskErrorResponse: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** TaskAnswer */
        TaskAnswer: {
            /**
             * Task Id
             * Format: uuid
             */
            task_id: string;
            /** Answer */
            answer: string;
        };
        /** TaskBatchSubmitRequest */
        TaskBatchSubmitRequest: {
            /** Answers */
            answers: components["schemas"]["TaskAnswer"][];
            /**
             * Message
             * @default
             */
            message: string;
        };
        /** SpeechSubmitResult */
        SpeechSubmitResult: {
            /** Task Id */
            task_id: string;
            /** Correct */
            correct: boolean;
            /**
             * Result
             * @default {}
             */
            result: {
                [key: string]: unknown;
            };
            /** Transcription */
            transcription: string;
            /** Feedback */
            feedback: string;
            /** Score */
            score: number;
            /**
             * Example Answer
             * @default
             */
            example_answer: string;
            /**
             * Example Segments
             * @default []
             */
            example_segments: {
                [key: string]: unknown;
            }[];
            /**
             * Explanation
             * @default
             */
            explanation: string;
        };
        /** VocabularyCategorySchema */
        VocabularyCategorySchema: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Color */
            color: string;
            /** Ordering */
            ordering: number;
        };
        /** ErrorResponse */
        ErrorResponse: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** VocabularyCategoryCreateRequest */
        VocabularyCategoryCreateRequest: {
            /** Name */
            name: string;
            /**
             * Color
             * @default
             */
            color: string;
            /**
             * Ordering
             * @default 0
             */
            ordering: number;
        };
        /** VocabularyCategoryUpdateRequest */
        VocabularyCategoryUpdateRequest: {
            /** Name */
            name?: string | null;
            /** Color */
            color?: string | null;
            /** Ordering */
            ordering?: number | null;
        };
        /** VocabSegmentSchema */
        VocabSegmentSchema: {
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
        };
        /** VocabularyItemSchema */
        VocabularyItemSchema: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Text */
            text: string;
            /** Segments */
            segments: components["schemas"]["VocabSegmentSchema"][];
            /** Meaning */
            meaning: string;
            /** Grammatical Category */
            grammatical_category: string;
            /** Extra */
            extra: {
                [key: string]: unknown;
            };
            /** Status */
            status: string;
            /** Notes */
            notes: string;
            /** Category Id */
            category_id: string | null;
            /** Created */
            created: string;
            /** Modified */
            modified: string;
        };
        /** VocabularyItemCreateResponse */
        VocabularyItemCreateResponse: {
            item: components["schemas"]["VocabularyItemSchema"];
            /** Already Existed */
            already_existed: boolean;
        };
        /** VocabularyItemCreateRequest */
        VocabularyItemCreateRequest: {
            /** Text */
            text: string;
            /** Category Id */
            category_id?: string | null;
            /**
             * Notes
             * @default
             */
            notes: string;
        };
        /** VocabularyItemUpdateRequest */
        VocabularyItemUpdateRequest: {
            /** Category Id */
            category_id?: string | null;
            /**
             * Clear Category
             * @default false
             */
            clear_category: boolean;
            /** Notes */
            notes?: string | null;
            /**
             * Re Enrich
             * @default false
             */
            re_enrich: boolean;
        };
        /** GeneratePhrasesResponse */
        GeneratePhrasesResponse: {
            /** Phrases */
            phrases: components["schemas"]["GeneratedPhrase"][];
        };
        /** GeneratedPhrase */
        GeneratedPhrase: {
            /** Segments */
            segments: components["schemas"]["VocabSegmentSchema"][];
            /** Meaning */
            meaning: string;
            /**
             * Explanation
             * @default
             */
            explanation: string;
        };
        /** SavePhrasesRequest */
        SavePhrasesRequest: {
            /** Phrases */
            phrases: components["schemas"]["GeneratedPhrase"][];
        };
        /** VocabOrganizeStartResponse */
        VocabOrganizeStartResponse: {
            /** Status */
            status: string;
            /** Uncategorized Count */
            uncategorized_count: number;
        };
        /** VocabOrganizeRequest */
        VocabOrganizeRequest: {
            /**
             * Allow Create Categories
             * @default false
             */
            allow_create_categories: boolean;
            /**
             * Hint
             * @default
             */
            hint: string;
        };
        /** VocabOrganizeStatusResponse */
        VocabOrganizeStatusResponse: {
            /** Status */
            status: string;
            /**
             * Summary
             * @default
             */
            summary: string;
            /**
             * Remaining Uncategorized
             * @default 0
             */
            remaining_uncategorized: number;
        };
        /** VocabOrganizeDismissResponse */
        VocabOrganizeDismissResponse: {
            /** Status */
            status: string;
        };
        /** VocabQASendResponse */
        VocabQASendResponse: {
            /** Status */
            status: string;
            /** Conversation Id */
            conversation_id: string;
            /** Message Id */
            message_id: string;
        };
        /** VocabQAErrorResponse */
        VocabQAErrorResponse: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** VocabQASendRequest */
        VocabQASendRequest: {
            /** Message */
            message: string;
        };
        /** VocabQAAudioSegmentSchema */
        VocabQAAudioSegmentSchema: {
            /** Kind */
            kind: string;
            /** Media Id */
            media_id: string;
            /** Url */
            url: string;
            /** Voice */
            voice: string;
            /** Text */
            text: string;
        };
        /** VocabQAHistoryResponse */
        VocabQAHistoryResponse: {
            /** Conversation Id */
            conversation_id: string | null;
            /** Messages */
            messages: components["schemas"]["VocabQAMessage"][];
        };
        /** VocabQAMessage */
        VocabQAMessage: {
            /** Id */
            id: string;
            /** Role */
            role: string;
            /** Content */
            content: string;
            /**
             * Created
             * Format: date-time
             */
            created: string;
            /**
             * Japanese Renders
             * @default []
             */
            japanese_renders: components["schemas"]["VocabQARenderSchema"][];
            /**
             * Audio Segments
             * @default []
             */
            audio_segments: components["schemas"]["VocabQAAudioSegmentSchema"][];
        };
        /** VocabQARenderSchema */
        VocabQARenderSchema: {
            /** Segments */
            segments: components["schemas"]["VocabQASegmentSchema"][];
            /**
             * Translation
             * @default
             */
            translation: string;
        };
        /** VocabQASegmentSchema */
        VocabQASegmentSchema: {
            /** Text */
            text: string;
            /** Furigana */
            furigana?: string | null;
        };
        /** VocabQAClearResponse */
        VocabQAClearResponse: {
            /** Status */
            status: string;
            /** Had Active Conversation */
            had_active_conversation: boolean;
        };
        /** VoiceCatalogResponse */
        VoiceCatalogResponse: {
            /** Voices */
            voices: components["schemas"]["VoiceOptionSchema"][];
            /** Default Narrator Voice */
            default_narrator_voice: string;
            /** Default Japanese Voice */
            default_japanese_voice: string;
        };
        /** VoiceOptionSchema */
        VoiceOptionSchema: {
            /** Id */
            id: string;
            /** Label */
            label: string;
        };
        /** MessageErrorResponse */
        MessageErrorResponse: {
            /** Error */
            error: string;
            /** Error Code */
            error_code: string;
        };
        /** VoicePreviewResponse */
        VoicePreviewResponse: {
            /** Media Id */
            media_id: string;
            /** Url */
            url: string;
        };
        /** VoicePreviewRequest */
        VoicePreviewRequest: {
            /** Voice */
            voice: string;
            /**
             * Role
             * @enum {string}
             */
            role: "narrator" | "japanese";
        };
        /** MessageAudioResponse */
        MessageAudioResponse: {
            /** Message Id */
            message_id: string;
            /** Segments */
            segments: components["schemas"]["AudioSegmentSchema"][];
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
    core_routers_auth_signup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
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
    core_routers_auth_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_get_current_user: {
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
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_patch_current_user: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
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
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_patch_active_organization: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrganizationUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationResponse"];
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
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_get_user_settings: {
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
                content: {
                    "application/json": components["schemas"]["UserSettingsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_put_user_settings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserSettingsUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserSettingsResponse"];
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
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_auth_logout: {
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
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseSchema"];
                };
            };
        };
    };
    core_routers_agentic_chat_health: {
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
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    core_routers_agentic_chat_get_conversation_history: {
        parameters: {
            query?: {
                limit?: number;
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
                    "application/json": components["schemas"]["AgenticChatHistoryResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_agentic_chat_list_conversations: {
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
                content: {
                    "application/json": components["schemas"]["AgenticChatConversationListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_agentic_chat_get_archived_conversation_history: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                conversation_id: string;
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
                    "application/json": components["schemas"]["AgenticChatHistoryResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_agentic_chat_clear_conversation: {
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
                content: {
                    "application/json": components["schemas"]["AgenticChatClearResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_agentic_chat_send_message: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AgenticChatMessageRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatMessageResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_agentic_chat_get_agentic_chat_run_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                celery_task_id: string;
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
                    "application/json": components["schemas"]["AgenticChatRunStatusResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgenticChatErrorResponse"];
                };
            };
        };
    };
    core_routers_tasks_submit_task_batch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskBatchSubmitRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskBatchSubmitResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
        };
    };
    core_routers_tasks_submit_speech: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Task Id
                     * Format: uuid
                     */
                    task_id: string;
                    /**
                     * Audio
                     * Format: binary
                     */
                    audio: Blob;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpeechSubmitResult"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_list_categories: {
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
                content: {
                    "application/json": components["schemas"]["VocabularyCategorySchema"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_create_category: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabularyCategoryCreateRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabularyCategorySchema"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_delete_category: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                category_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_update_category: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabularyCategoryUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabularyCategorySchema"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_list_items: {
        parameters: {
            query?: {
                category?: string | null;
                status?: string | null;
                q?: string | null;
                uncategorized?: boolean;
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
                    "application/json": components["schemas"]["VocabularyItemSchema"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_create_item: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabularyItemCreateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabularyItemCreateResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_get_item: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
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
                    "application/json": components["schemas"]["VocabularyItemSchema"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_delete_item: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_update_item: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabularyItemUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabularyItemSchema"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_generate_phrases: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
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
                    "application/json": components["schemas"]["GeneratePhrasesResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_save_phrases: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SavePhrasesRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabularyItemSchema"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_start_organize: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabOrganizeRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabOrganizeStartResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_organize_status: {
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
                content: {
                    "application/json": components["schemas"]["VocabOrganizeStatusResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocabulary_dismiss_organize: {
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
                content: {
                    "application/json": components["schemas"]["VocabOrganizeDismissResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    core_routers_vocab_qa_send_message: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VocabQASendRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQASendResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
        };
    };
    core_routers_vocab_qa_get_history: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
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
                    "application/json": components["schemas"]["VocabQAHistoryResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
        };
    };
    core_routers_vocab_qa_clear_conversation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                item_id: string;
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
                    "application/json": components["schemas"]["VocabQAClearResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VocabQAErrorResponse"];
                };
            };
        };
    };
    core_routers_messages_list_voices: {
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
                content: {
                    "application/json": components["schemas"]["VoiceCatalogResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageErrorResponse"];
                };
            };
        };
    };
    core_routers_messages_preview_voice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VoicePreviewRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VoicePreviewResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageErrorResponse"];
                };
            };
        };
    };
    core_routers_messages_generate_audio: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                message_id: string;
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
                    "application/json": components["schemas"]["MessageAudioResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageErrorResponse"];
                };
            };
        };
    };
}
