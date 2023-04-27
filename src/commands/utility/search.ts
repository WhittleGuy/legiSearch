import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const instance = axios.create({
  baseURL: 'https://api.legiscan.com/',
  timeout: 5000,
})

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Recieve links to helpful resources in a time of crisis')
    .addStringOption((option) =>
      option
        .setName('state')
        .setDescription(
          'The state whose legislature you want to search (abbreviation)'
        )
        .setRequired(true)
        .setMaxLength(2)
    )
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The term you want to search for')
        .setRequired(true)
    ),
  //@ts-ignore
  async execute(interaction) {
    const state = interaction.options.getString('state')
    const query = interaction.options.getString('query')

    const res = await instance.get('', {
      params: {
        key: process.env.APIKEY,
        op: 'getSearch',
        state: state,
        query: query,
      },
    })

    const results = res.data.searchresult
    const numberOfBills = Object.keys(results).length - 1
    const maxNumberToShow = 5
    let pageIndex = 1

    if (numberOfBills === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xff9ed7)
        .setTitle('LegiScan Search Results')
        .setDescription(`0 results for "${query}" in the state of ${state}`)

      await interaction.reply({
        embeds: [embed],
      })
      return
    }

    const createFields = (index: number) => {
      let fields: { name: string; value: string }[] = []
      for (let i = 5 * index - 4; i < 5 * index - 4 + maxNumberToShow; i++) {
        if (i > numberOfBills) break
        fields.push({
          //@ts-ignore
          name: `${results[i - 1].bill_number}`,
          //@ts-ignore
          value: `[${results[i - 1].title}](${results[i - 1].text_url})`,
        })
      }
      return fields
    }

    const createPagination = (pageNumber?: number) => {
      const numberOfButtons = Math.ceil(numberOfBills / maxNumberToShow)
      let buttons = []
      if (numberOfButtons <= 5) {
        for (let i = 0; i < numberOfButtons; i++) {
          const button = new ButtonBuilder()
            .setCustomId(`${i + 1}`)
            .setLabel(`${i + 1}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex === i + 1) //@ts-ignore
          buttons.push(button)
        }
        const row = new ActionRowBuilder().addComponents(buttons)
        return row
      } else {
        const back = new ButtonBuilder()
          .setCustomId(`legiSearch-button-back`)
          .setLabel(`⬅`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 1)
        const page = new ButtonBuilder()
          .setCustomId(`legiSearch-button-page`)
          .setLabel(`${pageNumber}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
        const next = new ButtonBuilder()
          .setCustomId(`legiSearch-button-next`)
          .setLabel(`➡`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === numberOfButtons)
        const row = new ActionRowBuilder().addComponents(back, page, next)
        return row
      }
    }

    const createEmbed = () => {
      const embed = new EmbedBuilder()
        .setColor(0xff9ed7)
        .setTitle('LegiScan Search Results')
        .setDescription(
          `${numberOfBills} results for "${query}" in the state of ${state}`
        )
        .addFields(createFields(pageIndex))
      return embed
    }

    const response = await interaction.reply({
      embeds: [createEmbed()],
      components: [createPagination(pageIndex)],
      ephemeral: true,
    })

    const waitForButtonInteraction = async () => {
      //@ts-ignore
      const collectorFilter = (i) => i.user.id === interaction.user.id
      try {
        const confirmation = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        })
        if (confirmation.customId === 'legiSearch-button-back') {
          pageIndex = pageIndex - 1
        } else if (confirmation.customId === 'legiSearch-button-next') {
          pageIndex = pageIndex + 1
        } else {
          pageIndex = Number(confirmation.customId)
        }
        await confirmation.update({
          embeds: [createEmbed()],
          components: [createPagination(pageIndex)],
        })
        waitForButtonInteraction()
      } catch {
        return
      }
    }
    waitForButtonInteraction()
  },
}
