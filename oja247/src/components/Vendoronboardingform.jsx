import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/api';
import './VendorOnboardingForm.css';

// Combined vendor onboarding form: payout info + KYC docs in one flow.
// Basic tier (NIN + bank match) is required to submit.
// Verified tier fields (CAC + address proof) are optional here — a vendor
// can list immediately on Basic and upgrade within the 30-day window.

export default function VendorOnboardingForm({ onSubmitted } = {}) {
  const { business, isAuthenticated } = useAuth();

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState(null);

  const [form, setForm] = useState({
    business_name: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    bank_code: '',
    account_number: '',
  });

  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [accountError, setAccountError] = useState(null);

  const [nin, setNin] = useState('');
  const [cacFile, setCacFile] = useState(null);
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);

  // Load banks for the dropdown
  useEffect(() => {
    let cancelled = false;
    setBanksLoading(true);
    axiosInstance
      .get('/api/vendors/banks')
      .then(({ data: res }) => {
        if (cancelled) return;
        if (res.status) {
          setBanks(res.data);
        } else {
          setBanksError(res.message || 'Could not load banks.');
        }
      })
      .catch(() => {
        if (!cancelled) setBanksError('Could not load banks. Check your connection.');
      })
      .finally(() => {
        if (!cancelled) setBanksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-resolve account name once both bank + full account number are entered
  useEffect(() => {
    setAccountName('');
    setAccountError(null);

    if (!form.bank_code || form.account_number.length !== 10) return;

    let cancelled = false;
    setResolvingAccount(true);

    const timeout = setTimeout(() => {
      axiosInstance
        .get('/api/vendors/resolve-account', {
          params: { account_number: form.account_number, bank_code: form.bank_code },
        })
        .then(({ data: res }) => {
          if (cancelled) return;
          if (res.status) {
            setAccountName(res.data.account_name);
          } else {
            setAccountError(res.message || 'Could not verify this account.');
          }
        })
        .catch(() => {
          if (!cancelled) setAccountError('Could not verify this account.');
        })
        .finally(() => {
          if (!cancelled) setResolvingAccount(false);
        });
    }, 500); // debounce

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [form.bank_code, form.account_number]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(setter, maxSizeMB = 5) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return setter(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Max size is ${maxSizeMB}MB.`);
        e.target.value = '';
        return setter(null);
      }
      setter(file);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!accountName) {
      setSubmitError('Please enter a valid account number so we can confirm the account name.');
      return;
    }
    if (!nin) {
      setSubmitError('NIN is required to list on OJA247.');
      return;
    }

    setSubmitting(true);

    const selectedBank = banks.find((b) => b.code === form.bank_code);
    const payload = new FormData();
    payload.append('business_id', business._id);
    payload.append('business_name', form.business_name);
    payload.append('contact_email', form.contact_email);
    payload.append('contact_phone', form.contact_phone);
    payload.append('contact_whatsapp', form.contact_whatsapp || form.contact_phone);
    payload.append('bank_code', form.bank_code);
    payload.append('bank_name', selectedBank?.name || '');
    payload.append('account_number', form.account_number);
    payload.append('account_name', accountName);
    payload.append('nin', nin);
    if (cacFile) payload.append('cac_document', cacFile);
    if (addressProofFile) payload.append('address_proof', addressProofFile);
    if (selfieFile) payload.append('selfie', selfieFile);

    try {
      const { data } = await axiosInstance.post('/api/vendors', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!data.status) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setResult(data.data);
      onSubmitted?.(data.data);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated || !business) {
    return (
      <div className="vof-card vof-success">
        <h2>Log in to set up your store</h2>
        <p>Vendor onboarding is tied to your business account — log in (or register a business) first.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="vof-card vof-success">
        <h2>You're in.</h2>
        <p>
          Your store is live on the <strong>{result.verificationTier === 'verified' ? 'Verified' : 'Basic'}</strong>{' '}
          tier.
        </p>
        {result.verificationTier === 'basic' && (
          <p className="vof-note">
            Add your CAC document, address proof, and a selfie any time to move up to Verified — it raises
            your payout limits and unlocks the Verified badge.
          </p>
        )}
        {result.verificationDeadline && (
          <p className="vof-note">
            Complete your verification before{' '}
            {new Date(result.verificationDeadline).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            or your listings will be hidden until you do.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="vof-card" onSubmit={handleSubmit}>
      <header className="vof-header">
        <h1>Set up your store</h1>
        <p>Payout details and ID verification — one form, five minutes.</p>
      </header>

      <fieldset>
        <legend>About your business</legend>

        <label className="vof-field">
          <span>Business name</span>
          <input
            type="text"
            required
            value={form.business_name}
            onChange={(e) => updateField('business_name', e.target.value)}
            placeholder="e.g. Adaeze Fabrics"
          />
        </label>

        <div className="vof-row">
          <label className="vof-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.contact_email}
              onChange={(e) => updateField('contact_email', e.target.value)}
            />
          </label>
          <label className="vof-field">
            <span>Phone</span>
            <input
              type="tel"
              required
              value={form.contact_phone}
              onChange={(e) => updateField('contact_phone', e.target.value)}
              placeholder="080..."
            />
          </label>
        </div>

        <label className="vof-field">
          <span>WhatsApp number (if different from phone)</span>
          <input
            type="tel"
            value={form.contact_whatsapp}
            onChange={(e) => updateField('contact_whatsapp', e.target.value)}
            placeholder="Order alerts go here"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Get paid</legend>

        <label className="vof-field">
          <span>Bank</span>
          {banksLoading ? (
            <div className="vof-skeleton" />
          ) : banksError ? (
            <p className="vof-error">{banksError}</p>
          ) : (
            <select
              required
              value={form.bank_code}
              onChange={(e) => updateField('bank_code', e.target.value)}
            >
              <option value="">Select your bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="vof-field">
          <span>Account number</span>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={10}
            value={form.account_number}
            onChange={(e) => updateField('account_number', e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit NUBAN"
          />
        </label>

        <div className="vof-account-status">
          {resolvingAccount && <span className="vof-muted">Checking account…</span>}
          {accountName && <span className="vof-confirmed">✓ {accountName}</span>}
          {accountError && <span className="vof-error">{accountError}</span>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Verify your identity</legend>

        <label className="vof-field">
          <span>NIN (National Identification Number)</span>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={11}
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
            placeholder="11 digits"
          />
        </label>

        <p className="vof-tier-note">
          This gets you to <strong>Basic</strong> — you can list right away. Add the two documents below
          any time in your first 30 days to reach <strong>Verified</strong> (higher payout limits, Verified
          badge).
        </p>

        <div className="vof-row">
          <label className="vof-field vof-upload">
            <span>CAC document <em>(optional now)</em></span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(setCacFile)} />
            {cacFile && <span className="vof-filename">{cacFile.name}</span>}
          </label>
          <label className="vof-field vof-upload">
            <span>Proof of address <em>(optional now)</em></span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange(setAddressProofFile)}
            />
            {addressProofFile && <span className="vof-filename">{addressProofFile.name}</span>}
          </label>
        </div>

        <label className="vof-field vof-upload">
          <span>Headshot / selfie <em>(optional now)</em></span>
          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange(setSelfieFile)} />
          {selfieFile && <span className="vof-filename">{selfieFile.name}</span>}
        </label>
      </fieldset>

      {submitError && <p className="vof-error vof-submit-error">{submitError}</p>}

      <button type="submit" className="vof-submit" disabled={submitting}>
        {submitting ? 'Setting up your store…' : 'Set up my store'}
      </button>
    </form>
  );
}