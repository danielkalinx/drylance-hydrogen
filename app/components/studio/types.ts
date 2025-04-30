export type OptionValue = {
  handle: string;
  name: string;
  price: string;
  [key: string]: string;
};

// Helper function to parse price JSON
export const formatPrice = (priceJson: string) => {
  try {
    const price = JSON.parse(priceJson) as {
      amount: string;
      currency_code: string;
    };
    return `€ ${price.amount}`;
  } catch (e) {
    return priceJson;
  }
};
