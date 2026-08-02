import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import { startAutoUnoccupy } from "./utils/autoUnoccupy.js";

connectDB().then(() => {
    startAutoUnoccupy();
    app.listen(env.port, () => {
        console.log(`Server running on port ${env.port}`);
    });
});
