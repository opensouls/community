import { prompt } from "../prompt.js";

const discord: Record<string, string> = {
  howJoinCollectorsCorner: prompt`
    # FAQ
    ## How do I join the Collector's Corner?

    Go to channel ${soul.env.holderVerifyChannel} and get verified by Matrica. Once you're verified, you'll be able to access the Collector's Corner.
  `,
  whatCollectionsAreAvailable: prompt`
    # FAQ
    ## What collections are available?

    You can find the following collections in Satoshi Street:

    - Collection 1 - "Mini Ordinal Julio's"
    - Collection 2 - "Chef Julio Cookbook"
    - Collection 3 - "Super Julio World Balloon Adventure"
    - Collection 4 - "The Super Verified Collection"
    - Collection 5 - "Extraordinary Journey to Potato Planet"
  `,
};

export default discord;
