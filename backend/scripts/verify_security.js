// Quick verification of login enumeration fix
async function test() {
    // Test with non-existent email
    const r1 = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@fake.com', password: 'WrongPass1!' })
    });
    const d1 = await r1.json();
    console.log('Non-existent email:', r1.status, d1.message);

    // Test with wrong password (if any user exists)
    const r2 = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'WrongPass1!' })
    });
    const d2 = await r2.json();
    console.log('Wrong password:   ', r2.status, d2.message);

    // Test checkout without token
    const r3 = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: [{ id: 1, quantity: 1 }] })
    });
    const d3 = await r3.json();
    console.log('No auth token:    ', r3.status, d3.message);

    console.log('\n✅ Both login errors should show the SAME message (no enumeration)');
    console.log('✅ Checkout should be DENIED without token');
}

test();
