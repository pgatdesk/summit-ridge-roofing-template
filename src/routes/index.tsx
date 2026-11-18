import { createFileRoute } from '@tanstack/react-router'
import { Header, Hero, TrustStrip, Services, Pricing, ServiceArea, Financing, Reviews, Footer } from '../components/sections'
import { EstimateForm } from '../components/EstimateForm'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Pricing />
        <ServiceArea />
        <Financing />
        <Reviews />
        <EstimateForm />
      </main>
      <Footer />
    </>
  )
}
