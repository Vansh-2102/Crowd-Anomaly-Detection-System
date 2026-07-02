import telegram
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram import Update

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    chat_id = update.effective_chat.id
    await update.message.reply_text(f"Your Chat ID is: {chat_id}")
    print(f"Chat ID found: {chat_id}")

if __name__ == "__main__":
    # Use your bot token here
    BOT_TOKEN = "8828558620:AAFlBuG9_g6RCGdlHqQ0oAq_dW09s3frnPE"

    print("Bot is starting...")
    print("Please send /start to your bot on Telegram to get your chat ID!")
    
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))

    app.run_polling()
