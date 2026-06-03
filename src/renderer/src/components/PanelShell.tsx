import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  title: string
  icon: string
  iconColor: string
  delay: number
  children: ReactNode
  headerAction?: ReactNode
}

export default function PanelShell({ title, icon, iconColor, delay, children, headerAction }: Props) {
  return (
    <motion.section
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.2, 0.7, 0.3, 1] } }}
    >
      <div className="phead">
        <span className="ptitle">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {headerAction}
          <i className={`ti ${icon}`} style={{ color: iconColor }} aria-hidden="true" />
        </div>
      </div>
      {children}
    </motion.section>
  )
}
