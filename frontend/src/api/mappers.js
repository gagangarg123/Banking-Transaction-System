// Map backend TransactionResponse -> UI transaction shape used by TxTable/pages
export const mapTransaction = (t, accNo) => ({
  id: t.transactionId,
  date: t.timestamp,
  type: t.type || '',
  fromId: t.sourceAccount === accNo ? 'me' : t.sourceAccount,
  toId: t.destinationAccount === accNo ? 'me' : t.destinationAccount,
  fromAcc: t.sourceAccount || '',
  toAcc: t.destinationAccount || '',
  fromName: t.sourceAccount || '—',
  toName: t.destinationAccount || '—',
  amount: Number(t.amount),
  status: t.status === 'SUCCESS' ? 'Completed' : t.status === 'REJECTED' ? 'Rejected' : 'Failed',
  reason: t.message || t.failureReason || '',
  remarks: '',
  thread: '',
})

// Find the logged-in customer's first account
export const findMyAccount = async (getAccounts, customerId) => {
  const list = await getAccounts()
  return (list || []).find((a) => a.customerId === customerId) || null
}
