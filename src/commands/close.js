const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ticketSchema = require('../schemas/ticket')
const discordTranscripts = require('discord-html-transcripts');
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Closes a ticket"),
    async execute(interaction) {
        const database = await ticketSchema.findOne({ channelId: interaction.channel.id })
        if (!database) return interaction.reply({ content: `This channel is not a ticket`, ephemeral: true })
        await interaction.reply({ content: `Closing this ticket.`})
        const logChannel = await interaction.guild.channels.cache.get(config.logChannelId)
        const attachment = await discordTranscripts.createTranscript(interaction.channel)
        const user = await interaction.client.users.fetch(database.userId)
        const embed = new EmbedBuilder()
            .setTitle('Ticket Transcript')
            .setColor('Blurple')
            .addFields({
                name: `Ticket Creator`,
                value: `<@${database.userId}> | ${database.userId}`,
                inline: true
            }, {
                name: `Channel ID`,
                value: `${database.channelId}`,
                inline: true
            })
        try {
            await user.send({ content: `Ticket Transcript`, files: [attachment] })
            await logChannel.send({ embeds: [embed], files: [attachment] })
        } catch (error) {
            console.log(error)
        }
        await ticketSchema.findOneAndDelete({ channelId: interaction.channel.id })
        await interaction.channel.delete()
    }
}
