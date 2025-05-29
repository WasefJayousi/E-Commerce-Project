
const stripe = Stripe('pk_test_51QuugqDhafaV9LChjmXKepEh6DmOF57hWQD7jt2N8ZAfFzzymQtizJTrdB32N5TOr02BBMcjqq6y6Cdt5KFjEpvz00OaWnODJS');

document.addEventListener('DOMContentLoaded', async () => {
  const clientSecret = localStorage.getItem('stripe_client_secret');

  if (!clientSecret) {
    document.getElementById('payment-message').textContent = 'Missing payment info.';
    return;
  }

  const elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');

  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:5500/payment-success.html'
      }
    });

    if (error) {
      document.getElementById('payment-message').textContent = error.message;
    }
  });
});
