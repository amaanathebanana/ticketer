const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ticketSchema = require('../schemas/ticket')

module.exports = {
    id: "start-ticket",
    async execute(interaction) {
        const database = await ticketSchema.findOne({ channelId: interaction.channel.id })
        if (!database) return interaction.reply({ content: `This channel is not a ticket`, ephemeral: true })
        if (database.started == true) return interaction.reply({ content: `This ticket has already closed.`, ephemeral: true })
        let label
        switch (database.type) {
            case "application":
                label = "Which role are you applying for?"
                break;
            case "support":
                label = "What you need support on?"
                break;
            case "report":
                label = "What you are reporting?"
                break;
        }

        const modal = new ModalBuilder()
            .setCustomId('start-ticket')
            .setTitle("Ticket Form")

        const question = new TextInputBuilder()
            .setCustomId('question')
            .setLabel(label)
            .setStyle(TextInputStyle.Paragraph)
        const row = new ActionRowBuilder().addComponents(question);
        modal.addComponents(row)
        await interaction.showModal(modal);
    }
}
