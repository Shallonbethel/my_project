document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#creditSaleForm');
    if (!form) return;
  
    const fields = {
      buyerName: { test: v => /^[A-Za-z0-9 ]{2,}$/.test(v), msg: 'Alphanumeric, min 2 chars' },
      nationalId: { test: v => /^C[A-Z]{2}\\d{8}[A-Z]{2}$/.test(v), msg: 'Invalid NIN format' },
      location: { test: v => /^[A-Za-z0-9 ]{2,}$/.test(v), msg: 'Alphanumeric, min 2 chars' },
      contact: { test: v => /^07\\d{8}$/.test(v), msg: 'Valid phone (e.g. 07XXXXXXXX)' },
      amountDue: { test: v => /^\\d{5,}$/.test(v) && Number(v) >= 10000, msg: 'Min 5 digits, >= 10000' },
      salesAgentName: { test: v => /^[A-Za-z0-9 ]{2,}$/.test(v), msg: 'Alphanumeric, min 2 chars' },
      dueDate: { test: v => !!v, msg: 'Due date required' },
      produceName: { test: v => /^[A-Za-z0-9 ]{2,}$/.test(v), msg: 'Alphanumeric, min 2 chars' },
      produceType: { test: v => /^[A-Za-z]{2,}$/.test(v), msg: 'Alphabets only, min 2 chars' },
      tonnage: { test: v => /^\\d{3,}$/.test(v) && Number(v) >= 100, msg: 'Min 3 digits, >= 100' },
      dateOfDispatch: { test: v => !!v, msg: 'Date of dispatch required' }
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