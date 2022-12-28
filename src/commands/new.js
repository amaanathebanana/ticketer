const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const config = require("../../config.json");
const ticketSchema = require('../schemas/ticket')
module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("new")
        .setDescription("Create a ticket")
        .addStringOption(option => option.setName('type').setDescription('The type of ticket').setRequired(true)
            .addChoices(
                { name: 'Support Ticket', value: 'support' },
                { name: 'Application Ticket', value: 'application' },
                { name: 'Report Ticket', value: 'report' },
            )),

    async execute(interaction, client) {
        const type = interaction.options.getString('type')
        await interaction.reply({ content: `Creating a ticket for you! Please wait.`, ephemeral: true })
        try {
            channel = await interaction.guild.channels.create({
                name: `${type}-${interaction.member.user.username}`,
                type: ChannelType.GuildText,
                parent: config.unstartedParentId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: interaction.member.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    }
                ]
            })
        } catch (error) {
            console.log(error)
            return interaction.editReply('There was an error while creating your ticket. Please report this to a staff member.')
        }
        const embed = new EmbedBuilder()
            .setTitle(`Ticket`)
            .setDescription(`${interaction.member} start your ticket using the button below!`)
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start-ticket')
                    .setLabel('Start Ticket')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('close-ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            )
        const message = await channel.send({ embeds: [embed], components: [row] })
        await new ticketSchema({
            type,
            userId: interaction.member.id,
            channelId: channel.id,
            started: false,
            messageId: message.id
        }).save()
        await interaction.editReply(`A ticket has been created for you at ${channel}`)
    }
}

