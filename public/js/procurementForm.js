document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#procurementForm');
    if (!form) return;
  
    const fields = {
      produceName: { test: v => /^[A-Za-z0-9 ]+$/.test(v), msg: 'Alphanumeric only' },
      produceType: { test: v => /^[A-Za-z]{2,}$/.test(v), msg: 'Alphabets only, min 2 chars' },
      date: { test: v => !!v, msg: 'Date required' },
      time: { test: v => !!v, msg: 'Time required' },
      tonnage: { test: v => /^\d{3,}$/.test(v) && Number(v) >= 100, msg: 'Min 3 digits, >= 100' },
      cost: { test: v => /^\d{5,}$/.test(v) && Number(v) >= 10000, msg: 'Min 5 digits, >= 10000' },
      dealerName: { test: v => /^[A-Za-z0-9 ]{2,}$/.test(v), msg: 'Alphanumeric, min 2 chars' },
      branch: { test: v => !!v, msg: 'Branch required' },
      contact: { test: v => /^07\d{8}$/.test(v), msg: 'Valid phone (e.g. 07XXXXXXXX)' },
      sellingPrice: { test: v => /^\d+$/.test(v), msg: 'Numeric only' }
    };
  
    form.addEventListener('submit', function (e) {
      let valid = true;
      Object.entries(fields).forEach(([name, rule]) => {
        const input = form.elements[name];
        const value = input ? input.value.trim() : '';
        let errorElem = input.nextElementSibling;
        if (!errorElem || !errorElem.classList.contains('form-error')) {
          errorElem = document.createElement('div');
          errorElem.className = 'form-error text-danger small';
          input.parentNode.insertBefore(errorElem, input.nextSibling);
        }
        if (!rule.test(value)) {
          input.classList.add('is-invalid');
          errorElem.textContent = rule.msg;
          valid = false;
        } else {
          input.classList.remove('is-invalid');
          errorElem.textContent = '';
        }
      });
      if (!valid) e.preventDefault();
    });
  });