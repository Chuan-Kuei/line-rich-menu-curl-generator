// Configuration file
const CONFIG = {
    // Image validation constraints
    IMAGE_CONSTRAINTS: {
        MIN_WIDTH: 800,
        MAX_WIDTH: 2500,
        MIN_HEIGHT: 250,
        MIN_ASPECT_RATIO: 1.45,
        MAX_FILE_SIZE: 1024 * 1024, // 1MB in bytes
        ALLOWED_TYPES: ['image/jpeg', 'image/png']
    },

    // Text field constraints
    TEXT_CONSTRAINTS: {
        MAX_NAME_LENGTH: 300,
        MAX_CHAT_BAR_TEXT_LENGTH: 14
    }
};
