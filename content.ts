import type { PlasmoCSConfig } from "~node_modules/plasmo/dist/type"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/video/*/analytics/tab-overview/*"],
  world: "MAIN"
}

interface IronActivateEvent extends Event {
  detail: {
    item: {
      value: string
    }
  }
}
interface PickerTrigger extends HTMLElement {
  text: string
}
interface YtaTimePicker extends HTMLElement {
  config: any
  updateTimePeriod: (args: any) => void
  closePickerMenu: () => void
}

const configOptions = [
  {
    option: {
      disabled: false,
      label: "First 7 days",
      tooltip: undefined,
      value: "first_7_days",
      veType: 116359
    },
    days: 7
  },
  {
    option: {
      disabled: false,
      label: "First 28 days",
      tooltip: undefined,
      value: "first_28_days",
      veType: 116359
    },
    days: 28
  },
  {
    option: {
      disabled: false,
      label: "First 90 days",
      tooltip: undefined,
      value: "first_90_days",
      veType: 116359
    },
    days: 90
  },
  {
    option: {
      disabled: false,
      label: "First 365 days",
      tooltip: undefined,
      value: "first_365_days",
      veType: 116359
    },
    days: 365
  }
]

;(async () => {
  const watchForElement = (query: string): Promise<HTMLElement> => {
    return new Promise((resolve) => {
      const existing = document.querySelector<HTMLElement>(query)
      if (existing) return resolve(existing)

      const observer = new MutationObserver(() => {
        const el = document.querySelector<HTMLElement>(query)
        if (el) {
          observer.disconnect()
          resolve(el)
        }
      })

      observer.observe(document.body, { childList: true, subtree: true })
    })
  }

  const paperList = await watchForElement("#picker-menu #paper-list")
  const timePicker = (await watchForElement("#yta-time-picker")) as YtaTimePicker
  const pickerTrigger = (await watchForElement("#picker-trigger")) as PickerTrigger

  paperList.addEventListener(
    "iron-activate",
    (e) => {
      const event = e as IronActivateEvent
      const option = configOptions.find((option) => option.option.value === event.detail.item.value)
      if (option) {
        // console.log("🛑 EVENT INTERCEPTED:", event.detail.item.value)
        event.stopImmediatePropagation()
        event.preventDefault()

        const payload = {
          type: "since_publish",
          relatedEntity: timePicker.config.entityConfig,
          timeUnit: "TIME_PERIOD_UNIT_NTH_DAYS",
          amountOfTimeUnits: option.days,
          nowInstant: undefined
        }
        timePicker.updateTimePeriod(payload)
        timePicker.closePickerMenu()

        pickerTrigger.text = option.option.label
      }
    },
    true
  )

  setInterval(() => {
    try {
      if (timePicker?.config?.optionsGroups) {
        const firstGroup = timePicker.config.optionsGroups[0]
        const exists = firstGroup.find(
          (option: any) => option.value === configOptions[0].option.value
        )
        if (!exists) {
          configOptions.forEach((optionConfig) => {
            firstGroup.push(optionConfig.option)
          })
        }
      }
    } catch (err) {}
  }, 50)

  console.log(timePicker.config)
})()
