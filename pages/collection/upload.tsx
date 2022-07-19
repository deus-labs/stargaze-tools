import Anchor from 'components/Anchor'
import { useCollectionStore } from 'contexts/collection'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { NFTStorage } from 'nft.storage'
import { useEffect, useRef, useState } from 'react'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const UploadPage: NextPage = () => {
  const wallet = useWallet()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState(50)
  const [numTokens, setNumTokens] = useState(1)
  const [perAddressLimit, setPerAddressLimit] = useState(1)
  const [startTime, setStartTime] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const baseTokenURI = useCollectionStore().base_token_uri
  const [baseImageURI, setBaseImageURI] = useState('')
  const [uploadMethod, setUploadMethod] = useState('New')
  const [parsedMetadata, setParsedMetadata] = useState('')

  const imageFilesRef = useRef<HTMLInputElement>(null)
  const metadataFilesRef = useRef<HTMLInputElement>(null)

  const NFT_STORAGE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJBODk5OGI4ZkE2YTM1NzMyYmMxQTRDQzNhOUU2M0Y2NUM3ZjA1RWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE5MTcwNDQ2MiwibmFtZSI6IlRlc3QifQ.IbdV_26bkPHSdd81sxox5AoG-5a4CCEY4aCrdbCXwAE'
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

  const handleChangeName = (event: { target: { value: React.SetStateAction<string> } }) => {
    setName(event.target.value.toString())
  }

  const handleChangeDescripion = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDescription(event.target.value.toString())
  }

  const handleChangeUnitPrice = (event: { target: { value: React.SetStateAction<string> } }) => {
    setUnitPrice(Number(event.target.value))
  }

  const handleChangeNumTokens = (event: { target: { value: React.SetStateAction<string> } }) => {
    setNumTokens(Number(event.target.value))
  }

  const handleChangePerAddressLimit = (event: { target: { value: React.SetStateAction<string> } }) => {
    setPerAddressLimit(Number(event.target.value))
  }

  function getExecutionTimeInNanosecs(): number {
    const yearMonthDay = date.split('-')
    return (
      new Date(
        `${Number(yearMonthDay[1]).toString()}-${Number(yearMonthDay[2]).toString()}-${Number(
          yearMonthDay[0],
        ).toString()}-${time}`,
      ).getTime() * 1000000
    )
  }

  const handleChangeDate = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDate(event.target.value)
  }

  const handleChangeTime = (event: { target: { value: React.SetStateAction<string> } }) => {
    setTime(event.target.value)
  }

  useEffect(() => {
    setStartTime(getExecutionTimeInNanosecs().toString())
  }, [date, time])

  return (
    <div>
      <NextSeo title="Create Collection" />

      <div className="mt-5 space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Upload Assets & Metadata</h1>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="justify-items-start mt-5 mb-3 ml-3 flex-column">
        <label className="block mt-3 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="name">
          Name
        </label>
        <input
          className="py-2 px-1 w-2/3 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
          id="name"
          onChange={handleChangeName}
          placeholder="Collection Name"
        />
        <label className="block mt-3 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="description">
          Description
        </label>
        <input
          className="py-2 px-1 mt-2 mb-2 w-2/3 bg-white/10 rounded border-2 border-white/20 focus:ring
        focus:ring-plumbus-20
        form-input, placeholder:text-white/50,"
          id="description"
          onChange={handleChangeDescripion}
          placeholder="An awesome NFT series"
        />
        <label className="block mt-3 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="numberoftokens">
          Number of Tokens
        </label>
        <input
          className="py-2 px-1 mt-2 mb-2 w-2/3 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
          id="numberoftokens"
          onChange={handleChangeNumTokens}
          placeholder="100"
          type="number"
        />
        <label className="block mt-3 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="unitprice">
          Unit Price
        </label>
        <input
          className="py-2 px-1 mt-2 mb-2 w-2/3 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
          id="unitprice"
          onChange={handleChangeUnitPrice}
          placeholder="100"
          type="number"
        />
        <label className="block mt-3 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="peraddresslimit">
          Per Address Limit
        </label>
        <input
          className="py-2 px-1 mt-2 mb-2 w-2/3 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
          id="peraddresslimit"
          onChange={handleChangePerAddressLimit}
          placeholder="1"
          type="number"
        />
        <label className="block mt-3 mr-1 mb-1 w-2/3 font-bold text-white dark:text-gray-300" htmlFor="starttime">
          Start Time
        </label>
        <div className="mt-3 w-2/3" id="starttime">
          <input
            className="py-2 px-1 mt-2 mr-2 mb-2 w-[48%] bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            onChange={handleChangeDate}
            type="date"
          />
          <input
            className="py-2 px-1 mt-2 mb-2 w-[48%] bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            onChange={handleChangeTime}
            type="time"
          />
        </div>
      </div>
    </div>
  )
}

export default withMetadata(UploadPage, { center: false })
