import { useState, useEffect } from 'react'
import './styles.css'

import blankConfig from './data/blankConfig'
import Clock from './components/Clock'
import News from './components/News'
import Quote from './components/Quote'
import Stocks from './components/Stocks'
import ToDo from './components/ToDo'
import Weather from './components/Weather'
import ConfigMenu from './components/ConfigMenu'

export default function App() {
  /* Challenge

    Kaydet butonu aslında kullanıcının widget yapılandırmasını kaydetmez. Göreviniz bunu aşağıdaki şekilde düzeltmektir: 

    	1. Kullanıcı kaydet butonuna tıkladığında ve böylece aşağıdaki 35. satırda save fonksiyonunu çağırdığında, widgetConfig state array localStorage'a kaydedilmelidir. 
       
    	2. WidgetConfig state, herhangi bir array kaydedilmişse, önceki adımda localStorage'a kaydedilen array olarak başlatılmalıdır. Aksi takdirde, DEFAULT_CONFIG olarak başlatılmalıdır.  
			 
	Not: Kaydet butonu, save fonksiyonunu çağırmak için zaten ayarlanmıştır. 
              
    Bonus görev: lazy state başlatmasını kullanarak ikinci görevi tamamlayın. 
*/

  const DEFAULT_CONFIG = blankConfig.map((widget) => {
    return { ...widget, positionData: { ...widget.positionData } }
  })

 
  const [widgetConfig, setWidgetConfig] = useState(() => {
    if (typeof window !== 'undefined') { 
      const savedConfig = localStorage.getItem('widgetConfig')
      return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG
    }
    return DEFAULT_CONFIG
  })

  const [saveRequested, setSaveRequested] = useState(false)

  function save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('widgetConfig', JSON.stringify(widgetConfig)) 
      setSaveRequested(true) 
    }
  }

  const widgetComponents = {
    Clock: <Clock />,
    News: <News />,
    Quote: <Quote />,
    Stocks: <Stocks />,
    ToDo: <ToDo />,
    Weather: <Weather />,
  }

  const savedMessage = (
    <div className='saved-message-container'>
      <p className='saved-message'>Kaydedildi</p>
    </div>
  )

  useEffect(() => {
    if (saveRequested) {
      setTimeout(() => {
        setSaveRequested(false)
      }, 1000)
    }
  }, [saveRequested])

  function dragHandler(e, data) {
    if (e.target.dataset.type !== 'button') {
      setWidgetConfig((prevConfig) => {
        let allConfigs = [...prevConfig]
        let targetConfig = allConfigs.find(
          (widget) => widget.name === data.node.classList[1]
        )
        targetConfig.positionData = {
          ...targetConfig.positionData,
          customPosition: true,
          x: data.x,
          y: data.y,
        }
        return allConfigs
      })
    }
  }

  function getOffset(name) {
    let targetConfig = widgetConfig.find((widget) => widget.name === name)
    if (!targetConfig.positionData.customPosition) {
      return undefined
    } else {
      return { x: targetConfig.positionData.x, y: targetConfig.positionData.y }
    }
  }

  const widgetsToDisplay = widgetConfig
    .filter((widget) => widget.selected)
    .map((widget) => {
      const component = {
        ...widgetComponents[widget.name],
        key: crypto.randomUUID(),
      }
      component.props = {
        ...component.props,
        name: widget.name,
        gridArea: widget.positionData.gridArea,
        getOffset: getOffset,
        dragHandler: dragHandler,
        changeHandler: changeHandler,
      }
      return component
    })

  function changeHandler(event) {
    setWidgetConfig((prevConfig) => {
      return prevConfig.map((widget) => {
        return widget.name === event.target.name
          ? { ...widget, selected: !widget.selected }
          : { ...widget }
      })
    })
  }

  return (
    <div className='wrapper'>
      {saveRequested && savedMessage}
      <div className='widget-container'>{widgetsToDisplay}</div>
      <ConfigMenu
        stateProps={{ widgetConfig, setWidgetConfig, DEFAULT_CONFIG }}
        changeHandler={changeHandler}
        save={save}
      />
    </div>
  )
}
