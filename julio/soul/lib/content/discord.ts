import { prompt } from "../prompt.js";

const discord: Record<string, string> = {
  theServer: prompt`
    # Super Julio World Discord Server
    ## Overview

    The Super Julio World Discord Server is split into three main areas, kind of like levels in a video game:

    - Level 1: Welcome Area
    - Level 2: Satoshi Street
    - Level 3: Collectors' Corner (RESTRICTED LEVEL: Only for people who purchase an ordinal on secondary and get verified by Matrica.)

    Tags: This Discord Server, Julio's Discord Server
  `,
  theWelcomeArea: prompt`
    # Super Julio World Discord Server
    ## Level 1: Welcome Area

    The Welcome Area (Level 1) is the starting point of our adventure. It's like the entrance hall where you get a cool badge (that's the Matrica verification) to show you're one of the team. You can chat here, just like you would on the playground, and it's for everyone, whether you're new or have been around for a while.
  `,
  satoshiStreet: prompt`
    # Super Julio World Discord Server
    ## Level 2: Satoshi Street

    Satoshi Street (Level 2) is envisioned as the main street of a bustling digital city and it is the heart of our adventure! There's an update channel that's like a magical billboard, keeping you in the loop about all the exciting things happening in Super Julio World.
    
    In Satoshi Street, you can also find:

    - Spaces: A place where friends gather to dream up and chat about future adventures.

    - Collections: There are five collections, each with its own unique theme, and they're all part of the magic of Super Julio World: "Mini Ordinal Julio's", "Chef Julio Cookbook", "Super Julio World Balloon Adventure", "The Super Verified Collection", "Extraordinary Journey to Potato Planet".
  `,
  satoshiStreetSpaces: prompt`
    # Super Julio World Discord Server
    ## Level 2: Satoshi Street
    ### Spaces

    "Spaces" are like a magical clubhouse where friends gather to dream up and chat about future adventures, almost like planning treasure hunts or space explorations, but for podcasts and projects. It's a place where everyone shares their big ideas and exciting plans, making it a hub for imagination and creativity. Think of it as sitting in a treehouse with your friends, using your wildest dreams to paint the future of Super Julio World together, filled with mystery, magic, and endless possibilities.
  `,
  satoshiStreetcollections: prompt`
    # Super Julio World Discord Server
    ## Level 2: Satoshi Street
    ### Collections

    You can find five collections in Satoshi Street, and they're all part of the magic of Super Julio World:
    - Collection 1 - "Mini Ordinal Julio's"
    - Collection 2 - "Chef Julio Cookbook"
    - Collection 3 - "Super Julio World Balloon Adventure"
    - Collection 4 - "The Super Verified Collection"
    - Collection 5 - "Extraordinary Journey to Potato Planet"

    Tags: Available collections, New collections, Digital collectibles
  `,
  collectorsCorner: prompt`
    # Super Julio World Discord Server
    ## Level 3: Collectors' Corner

    Collectors' Corner (Level 3) is where the treasure hunters gather. It's filled with unique and magical collections, each telling a part of Julio's story. But it isn't just a place to see cool things; it's where you become part of the story, make new friends, and even help dream up the next chapter of Super Julio World. It's a place of magic, friendship, and endless adventure, waiting for you to join and discover its secrets!

    RESTRICTED LEVEL: Only for people who purchase an ordinal on secondary and get verified by Matrica.
    
    The Collectors' Corner is split into three main areas:
    - The Collector Hangout
    - Magical Collections
    - Product and Book Development Area
    `,
  collectorsCornerHangout: prompt`
    # Super Julio World Discord Server
    ## Level 3: Collectors' Corner
    ### The Collector Hangout

    Think of the Collector Hangout like the coolest clubhouse or the treehouse where all the kids want to be. Here, all the treasure hunters (which means you and your friends who collect cool stuff!) come together. It's a special spot where you can make new friends, share stories about your collections, and even get secret passes (early access WL) to see new treasures before anyone else. It's like being part of a secret club where everyone shares what they love and gets to see new, exciting things first!
  `,
  collectorsCornerCollections: prompt`
    # Super Julio World Discord Server
    ## Level 3: Collectors' Corner
    ### Magical Collections

    This part of the Collectors' Corner is like a treasure chest filled with the most amazing stories of Julio. Each collection is a chapter of his adventure, with magical items and tales that take you on a journey through Super Julio World. You'll find everything from tiny, pixelated art pieces that remind you of old video games to magical cookbooks with recipes that might as well be spells for deliciousness. Each piece is a part of Julio's story, waiting for you to discover and add to your collection of wonders.
  `,
  collectorsCornerProductAndBookDevelopmentArea: prompt`
    # Super Julio World Discord Server
    ## Level 3: Collectors' Corner
    ### Product and Book Development Area

    Now, this is where the magic happens! Imagine you're in a wizard's lab or an inventor's workshop. This area of the Collectors' Corner is where new treasures are dreamed up and created. It's not just about looking at cool stuff; it's about seeing how they come to life! From books that take you on adventures to new products that bring the magic of Super Julio World into our world, this is where you get to peek behind the curtain. And the best part? Being here means you're one of the first to know about these magical creations, almost like being Julio's helper in crafting his next great adventure!
  `,
};

export default discord;
