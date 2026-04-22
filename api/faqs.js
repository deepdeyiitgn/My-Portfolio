module.exports = async (_req, res) => {
  const payload = {
    items: [
      {
        id: 1,
        question: 'Why is development currently limited?',
        answer: 'Major feature shipping is paused during the academic focus cycle, but maintenance and quality upgrades continue.',
      },
      {
        id: 2,
        question: 'How do I collaborate post-2027?',
        answer: 'Use the contact pipeline and select collaboration support type. You will receive a tracked ticket ID and SLA response window.',
      },
      {
        id: 3,
        question: 'What is your architecture focus?',
        answer: 'Performance-first frontend systems with measurable outcomes, strong UX, and maintainable modular structure.',
      },
    ],
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};
