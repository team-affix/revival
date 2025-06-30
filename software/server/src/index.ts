#!/usr/bin/env node

import config from './config';
import app from './app';

// Start the server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
