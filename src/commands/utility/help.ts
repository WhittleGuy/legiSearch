import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

const embed = new EmbedBuilder()
  .setColor(0xff9ed7)
  .setTitle('**If you or a loved one are in immediate danger, call 911**')
  .setDescription(
    "Sometimes you need to ask for help, and that's okay. Below are some useful resources available in the US."
  )
  .addFields(
    {
      name: 'Suicide Hotline',
      value: 'Call 988\nCall 1.800.273.8255\nhttps://988lifeline.org/chat/',
    },
    {
      name: 'Domestic Violence',
      value:
        'Call 1.800.799.SAFE (7233)\nText "START" to 88788\nhttps://www.thehotline.org/',
    },
    { name: 'Sexual Assault', value: '1.800.656.4673\nhttps://www.rainn.org/' },
    {
      name: 'Crisis Text Line',
      value: 'Text "HOME" to 741741\nhttps://www.crisistextline.org/',
    },
    {
      name: 'Trans Lifeline',
      value: 'Call 1.877.565.8860\nhttps://translifeline.org/',
    },
    {
      name: 'Trevor Project (LGBTQ+)',
      value: '1.866.488.7386\nhttps://www.thetrevorproject.org/',
    },
    {
      name: 'Veteran Crisis Line',
      value:
        'Call 1.800.273.8255 & Press 1\nText 838255\nhttps://www.veteranscrisisline.net/',
    },
    {
      name: 'Abortion Resources',
      value: 'https://www.plannedparenthood.org/abortion-access?',
    },
    {
      name: 'Additional Hotlines and Services',
      value: 'https://www.apa.org/topics/crisis-hotlines',
    }
  )

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Recieve links to helpful resources in a time of crisis'),
  //@ts-ignore
  async execute(interaction) {
    await interaction.reply({ embeds: [embed], ephemeral: true })
  },
}
