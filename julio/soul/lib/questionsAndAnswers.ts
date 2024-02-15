import { prompt } from "./prompt.js";

const questionsAndAnswers: {
  questions: string[];
  answer: string;
}[] = [
  {
    questions: ["what are bitcoin ordinals?", "what are ordinals?"],
    answer: prompt`
      bitcoin ordinals assign a unique identifier to each satoshi, the smallest unit of bitcoin, allowing them to carry individual pieces of data like images or text. this process, known as inscription, transforms these satoshis into unique digital assets. essentially, it's a way to utilize the bitcoin blockchain for more than just transactions, enabling the creation and transfer of digital collectibles or art directly on bitcoin. it leverages bitcoin's security and network but introduces a new layer of utility and creativity.
    `,
  },

  {
    questions: [
      "what are inscriptions?",
      "what is an inscription?",
      "what is a bitcoin inscription?",
      "what is an ordinal inscription?",
    ],
    answer: prompt`
      inscriptions are a way to mark individual satoshis, the smallest unit of bitcoin, with unique content, making each one distinct. think of it like digitally carving a message or image onto a tiny digital coin. this content is stored directly on the bitcoin blockchain, making it as secure and permanent as any bitcoin transaction. since it's on the blockchain, anyone can see it, and it can't be changed or removed, giving these inscribed satoshis a unique identity and potentially adding value or significance beyond their monetary worth.
    `,
  },
  {
    questions: [
      "what is ordinal rarity?",
      "what is rarity in bitcoin ordinals?",
      "what is rarity in ordinals?",
      "what does it mean for a satoshi to be rare?",
      "how many rare satoshis are there?",
    ],
    answer: prompt`
      ordinal rarity within bitcoin ordinals provides a framework for assessing the uniqueness of satoshis, the smallest bitcoin units, based on their mining order. this concept categorizes satoshis into various rarity levels, from common to mythic, influenced by their position in the blockchain. common satoshis are plentiful, while mythic ones, like those from the genesis block, are exceptionally rare. rarity levels are further defined by bitcoin's mining milestones, such as block firsts, halving events, and difficulty adjustments, each adding a layer of desirability.
      
      this system transforms the collection of ordinals into a nuanced activity, where collectors value satoshis not just for their monetary worth but for their rarity and the unique place they hold in bitcoin's history.

      total satoshi supply by rarity level:
      - common: 2.1 quadrillion
      - uncommon: 6,929,999
      - rare: 3437
      - epic: 32
      - legendary: 5
      - mythic: 1
    `,
  },
  {
    questions: [
      "how do bitcoin ordinals differ from traditional nfts?",
      "which one is better, bitcoin ordinals or traditional nfts?",
      "what are the advantages of bitcoin ordinals over traditional nfts?",
      "how do bitcoin ordinals compare to traditional nfts?",
    ],
    answer: prompt`
    bitcoin ordinals bring a fresh perspective to digital collectibles by embedding them directly into individual satoshis, the smallest units of bitcoin, leveraging the robustness and simplicity of the bitcoin blockchain. this method stands in contrast to traditional nfts, which are often built on separate blockchain layers that require more complex interactions and dependencies. with ordinals, ownership is absolute and transparent, rooted in the bitcoin network's proven security and decentralization. this ensures that each digital artifact is complete, uncensorable, and uniquely owned, without the need for intermediary platforms or contracts.
    
    compared to traditional nfts, ordinals offer a more straightforward and resilient approach to digital ownership, where the integrity, longevity, and resistance to censorship of collectibles are inherently enhanced by bitcoin's foundational principles.
  `,
  },
];

export default questionsAndAnswers;
