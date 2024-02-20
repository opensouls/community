import { prompt } from "../prompt.js";

const ordinals: Record<string, string> = {
  definition: prompt`
    # Bitcoin Ordinals

    ## Definition

    Bitcoin ordinals assign a unique identifier to each satoshi, the smallest unit of Bitcoin, allowing them to carry individual pieces of data like images or text. This process, known as inscription, transforms these satoshis into unique digital assets. Essentially, it's a way to utilize the Bitcoin blockchain for more than just transactions, enabling the creation and transfer of digital collectibles or art directly on Bitcoin. It leverages Bitcoin's security and network but introduces a new layer of utility and creativity.
  `,
  inscriptions: prompt`
    # Bitcoin Ordinals

    ## Inscriptions

    Inscriptions are a way to mark individual satoshis, the smallest unit of Bitcoin, with unique content, making each one distinct. It's like digitally carving a message or image onto a tiny digital coin. This content is stored directly on the Bitcoin blockchain, making it as secure and permanent as any Bitcoin transaction. Since it's on the blockchain, anyone can see it, and it can't be changed or removed, giving these inscribed satoshis a unique identity and potentially adding value or significance beyond their monetary worth.
  `,
  rarity: prompt`
    # Bitcoin Ordinals

    ## Ordinal rarity

    Ordinal rarity within Bitcoin ordinals provides a framework for assessing the uniqueness of satoshis, the smallest Bitcoin units, based on their mining order. This concept categorizes satoshis into various rarity levels, from common to mythic, influenced by their position in the blockchain. Common satoshis are plentiful, while mythic ones, like those from the genesis block, are exceptionally rare. Rarity levels are further defined by Bitcoin's mining milestones, such as block firsts, halving events, and difficulty adjustments, each adding a layer of desirability.
    
    This system transforms the collection of ordinals into a nuanced activity, where collectors value satoshis not just for their monetary worth but for their rarity and the unique place they hold in Bitcoin's history.

    Total satoshi supply by rarity level:
    - Common: 2.1 quadrillion
    - Uncommon: 6,929,999
    - Rare: 3437
    - Epic: 32
    - Legendary: 5
    - Mythic: 1
  `,
  recursion: prompt`
    # Bitcoin Ordinals

    ## Ordinal Recursion

    The concept of ordinal recursion introduces a a transformative approach to digital asset creation, blending the realms of art, finance, and technology on the blockchain. It enables the creation of unique digital artifacts that are recursively linked to one another. This process allows for the creation of a new digital artifact from an existing one, creating a chain of linked artifacts that share a common origin. The ordinals protocol allows the creation of interconnected digital assets that reference and utilize data from previous inscriptions, forming a complex web of interlinked content.
  `,
  nftComparison: prompt`
    # Bitcoin Ordinals

    ## Ordinals vs. NFTs
    
    Bitcoin ordinals bring a fresh perspective to digital collectibles by embedding them directly into individual satoshis, the smallest units of Bitcoin, leveraging the robustness and simplicity of the Bitcoin blockchain. This method stands in contrast to traditional NFTs, which are often built on separate blockchain layers that require more complex interactions and dependencies. With ordinals, ownership is absolute and transparent, rooted in the Bitcoin network's proven security and decentralization. This ensures that each digital artifact is complete, uncensorable, and uniquely owned, without the need for intermediary platforms or contracts.
    
    Compared to traditional NFTs, ordinals offer a more straightforward and resilient approach to digital ownership, where the integrity, longevity, and resistance to censorship of collectibles are inherently enhanced by Bitcoin's foundational principles.
  `,
};

export default ordinals;
