
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const days = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
  'Sunday'
]
export const tableBlock = (name, number='', radiologist='', refer='', age='', gender='') => ({
  "blocks": [
      {
          "id": "dR_C0kYEVg",
          "type": "table",
          "data": {
              "content": [
                  [
                      `\n\t\t\t\tName: ${name} \n\t\t\t\t\n\t\t\t\t\n\t\t\t`,
                      "",
                      `Number: ${number}`
                  ],
                  [
                      `\n\t\t\t\tAge:\n\t\t\t\ ${age} \n\t\t\t`,
                      `\n\t\t\t\t          Gender:\n\t\t\t\t ${gender} \n\t\t\t\t\n\t\t\t`,
                      `Referred By: ${refer}`
                  ]
              ]
          }
      },
      {
        "id": "qUZRjXFkUv",
        "type": "table",
        "data": {
            "content": [
                [
                    "\n\t\t\tRadiologist\n\t\t"
                ],
                [
                    `\n\t\t\tName:\t\t\t${radiologist}\n\t\t\tSign…………………………\n\t\t`
                ],
                [
                    "\n\t\t\tDate:\n\t\t"
                ],
                [
                    "\n\t\t\tCell phone:\n\t\t"
                ]
            ]
        }
    }
  ],
})
function useDateFormat (date) {
  const formatDate = new Date(date)
  return formatDate.getDate() + '/' + (formatDate.getMonth() + 1) + '/' + formatDate.getFullYear()
}

function useDateTime (time) {
  const date = new Date(time)
  return date.getHours() + ':' +
  ('0' + date.getUTCMinutes()).slice(-2) +
   ' ' +
  ((date.getHours() > 12) ? 'PM' : 'AM')
}

function useDateString (date, state) {
  const formatDate = new Date(date)
  const Month = monthNames[formatDate.getMonth()]
  if (state) {
    return Month + ' ' + formatDate.getDate() + ', ' + formatDate.getFullYear()
  }
  return days[formatDate.getDay() - 1]
}

function useGetMonthName (date) {
  return monthNames[date.getMonth()]
}

function useGetDay (date) {
  return date.getDate()
}

function useGetTimeFrame (to, from) {
  return `${monthNames[to.getMonth()].substring(0, 3)} ${to.getDate()} - ${monthNames[from.getMonth()].substring(0, 3)} ${from.getDate()} ${from.getFullYear()}`
}

function useGetTimer(time) {
  return /^\d+$/.test(time)
}

function useGetPrice (value) {
  return ((parseFloat(value)/60) * .5).toFixed(2)
}

function useChecker (name) {
  if (Object.keys(name)) {
    if (name.Value && name.Value[0]) {
      if (name.Value[0].Alphabetic) {
        return name.Value[0].Alphabetic
      } else {
        return name.Value[0]
      }
    }
    return 'None'
  }
  return 'N/A'
}

export {
  useChecker,
    useGetDay,
  useGetMonthName,
  useGetTimeFrame,
  useDateFormat,
  useDateString,
  useDateTime,
  useGetTimer,
  useGetPrice
}
