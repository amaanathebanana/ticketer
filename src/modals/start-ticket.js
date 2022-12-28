const ticketSchema = require('../schemas/ticket');
const config = require('../../config.json');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
    id: 'start-ticket',
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })
        const answer = interaction.fields.getTextInputValue('question');
        const database = await ticketSchema.findOne({ channelId: interaction.channel.id })
        if (!database) return interaction.reply({ content: `This channel is not a ticket`, ephemeral: true })
        if (database.started == true) return interaction.reply({ content: `This ticket has already closed.`, ephemeral: true })
        if (database.userId !== interaction.user.id) return interaction.reply({ content: `You are not the owner of this ticket`, ephemeral: true })
        let message = await interaction.channel.messages.fetch(database.messageId)
        let description, data

        switch (database.type) {
            case "application":
                description = `${interaction.user} is applying for \`${answer}\``
                data = config.applicationTicketSettings[0]
                break;
            case "support":
                description = `${interaction.user} needs support on \`${answer}\``
                data = config.supportTicketSettings[0]
                break;
            case "report":
                description = `${interaction.user} is reporting \`${answer}\``
                data = config.reportTicketSettings[0]
        }
        const embed = new EmbedBuilder()
            .setTitle('Ticket')
            .setDescription(description)
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close-ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            )
        await message.edit({ embeds: [embed], components: [row] })
        await interaction.channel.setParent(data.parentId)
        await interaction.channel.permissionOverwrites.edit(data.staffRole, {
            SendMessages: true,
            ViewChannel: true,
            ReadMessageHistory: true
        })
        await ticketSchema.findOneAndUpdate({ channelId: interaction.channel.id }, { started: true })
        await interaction.channel.send(`<@&${data.staffRole}>`)
        await interaction.editReply({
            content: 'A staff member will be with you shortly',
            ephemeral: true
        })
    }
}
