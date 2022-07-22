import clsx from 'clsx'
import Anchor from 'components/Anchor'
import AnchorButton from 'components/AnchorButton'
import Button from 'components/Button'
import { useCollectionStore } from 'contexts/collection'
import { setBaseTokenUri, setImage } from 'contexts/collection'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Blob, File, NFTStorage } from 'nft.storage'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { naturalCompare } from 'utils/sort'
import { UrlInput } from '../../components/forms/FormInput';
import { AnchorButtonProps } from '../../components/AnchorButton';
import { Conditional } from 'components/Conditional'

interface ImagePreview{
  name: string,
  dataURL: string;
}

let imageFilesArray: File[] = [];
let metadataFilesArray: File[] = [];
let updatedMetadataFilesArray: File[] = [];

const UploadPage: NextPage = () => {
  const wallet = useWallet()
  

  const baseTokenURI = useCollectionStore().base_token_uri
  const [baseImageURI, setBaseImageURI] = useState('')
  const [uploadMethod, setUploadMethod] = useState('New')
  const [parsedMetadata, setParsedMetadata] = useState<any>(null)
  const [metadataAttributes, setMetadataAttributes] = useState<Record<string, string>[]>([])
  const [metadataFileArrayIndex, setMetadataFileArrayIndex] = useState(0)



  const imageFilesRef = useRef<HTMLInputElement>(null)
  const metadataFilesRef = useRef<HTMLInputElement>(null)

  const NFT_STORAGE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJBODk5OGI4ZkE2YTM1NzMyYmMxQTRDQzNhOUU2M0Y2NUM3ZjA1RWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE5MTcwNDQ2MiwibmFtZSI6IlRlc3QifQ.IbdV_26bkPHSdd81sxox5AoG-5a4CCEY4aCrdbCXwAE'
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

  const handleChangeBaseTokenUri = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setBaseTokenUri(event.target.value.toString())
  }

  const handleChangeImage = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setImage(event.target.value.toString())
  }

  const selectImages = (event: ChangeEvent<HTMLInputElement>
  ) => {
      imageFilesArray = []
      console.log(event.target.files)
      let reader: FileReader;
      if (event.target.files === null)
        return;
      for(let i = 0; i < event.target.files?.length;i++){
        reader = new FileReader(); 
        reader.onload = function(e){
          if (!e.target?.result) return toast.error('Error parsing file.')
          if (!event.target.files) return toast.error('No files selected.')
          let imageFile = new File(
            [e.target.result],
            event.target.files[i].name,
            { type: 'image/jpg' }
          )
          imageFilesArray.push(imageFile)
        }
        if (!event.target.files) return toast.error('No file selected.')
        reader.readAsArrayBuffer(event.target.files[i]);
        reader.onloadend = function(e){
          imageFilesArray.sort((a, b) => naturalCompare(a.name, b.name))
        }
      }
  }
  
  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    metadataFilesArray = []
    console.log(imageFilesArray)
    console.log(event.target.files)
    let reader: FileReader
    if (event.target.files === null)
       return toast.error('No files selected.')
    for (let i = 0; i < event.target.files?.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files)
          return toast.error('No files selected.')
        let metadataFile = new File(
          [e.target.result],
            event.target.files[i].name,
          { type: 'image/jpg' }
        )
        metadataFilesArray.push(metadataFile)
      }
      if (!event.target.files) return toast.error('No file selected.')
      reader.readAsText(event.target.files[i], 'utf8')
      reader.onloadend = function(e){
        metadataFilesArray.sort((a, b) => naturalCompare(a.name, b.name))
        console.log(metadataFilesArray)
      }
    }
  }
  const updateMetadata = async () => {
    console.log(imageFilesArray)
    const imageURI = await client.storeDirectory(imageFilesArray)
    console.log(imageURI)
    updatedMetadataFilesArray = []
    let reader: FileReader
    for (let i = 0; i < metadataFilesArray.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        let metadataJSON = JSON.parse(e.target?.result as string)
        metadataJSON.image = `ipfs://${imageURI}/${imageFilesArray[i].name}`
        let metadataFileBlob = new Blob([JSON.stringify(metadataJSON)], {
          type: 'application/json',
        })
        let updatedMetadataFile = new File(
          [metadataFileBlob],
          metadataFilesArray[i].name,
          { type: 'application/json' }
        )
        updatedMetadataFilesArray.push(updatedMetadataFile)
        console.log(updatedMetadataFile.name + ' => ' + metadataJSON.image)
        if (i === metadataFilesArray.length - 1) {
          upload()
        }
      }
      reader.readAsText(metadataFilesArray[i], 'utf8')
      //reader.onloadend = function (e) { ...
    }
  }
  const upload = async () => {
    const baseTokenURI = await client.storeDirectory(updatedMetadataFilesArray)
    console.log(baseTokenURI)
  }

  const parseMetadata = async (index: number) => {
    console.log("Parsing metadata...")
    setMetadataFileArrayIndex(index)
    let parsedMetadataObject = JSON.parse(await metadataFilesArray[index]?.text()) || null 
    setParsedMetadata(parsedMetadataObject)
    let metadata_name = document.querySelector("#metadata_name") as HTMLInputElement
    let metadata_description = document.querySelector("#metadata_description") as HTMLInputElement
    let metadata_external_url = document.querySelector("#metadata_external_url") as HTMLInputElement
    let metadata_image = document.querySelector("#metadata_image") as HTMLInputElement
    metadata_name.value = parsedMetadataObject?.name || ''
    metadata_description.value = parsedMetadataObject?.description || ''
    metadata_external_url.value = parsedMetadataObject?.external_url || ''
    metadata_image.value = (updatedMetadataFilesArray.length > 0 ? (JSON.parse(await updatedMetadataFilesArray[index]?.text()))?.image || "" : 'Not uploaded yet.') 
  }

  // useEffect(() => {
  
  // }, [parsedMetadata?.attributes])

  const updateMainMetadataValues = () => {
    console.log("Updating main metadata values...")
    let parsedMetadataObject = {...parsedMetadata}
    let metadata_name = document.querySelector("#metadata_name") as HTMLInputElement
    let metadata_description = document.querySelector("#metadata_description") as HTMLInputElement
    let metadata_external_url = document.querySelector("#metadata_external_url") as HTMLInputElement
    
    parsedMetadataObject.name = metadata_name.value
    parsedMetadataObject.description = metadata_description.value
    parsedMetadataObject.external_url = metadata_external_url.value
    setParsedMetadata(parsedMetadataObject)
  }

  const updateMetadataAttributes = async (index: number) => {
    console.log("Updating metadata attributes...")
    let parsedMetadataObject = {...parsedMetadata}
    let trait_type_input = document.querySelector(`#attribute-trait-type-input-${index}`) as HTMLInputElement
    let trait_value_input = document.querySelector(`#attribute-trait-value-input-${index}`) as HTMLInputElement
    
    parsedMetadata.attributes[index] = {trait_type: trait_type_input?.value, value: trait_value_input?.value}
    setParsedMetadata(parsedMetadataObject)
  }

  const removeMetadataAttribute = (index: number) => {
    let parsedMetadataObject = {...parsedMetadata}
    
    console.log(parsedMetadata?.attributes)
    console.log(parsedMetadata.attributes.splice(index,1))
    console.log(parsedMetadata?.attributes)
    setParsedMetadata(parsedMetadataObject)
    console.log(parsedMetadata)
  }

  const addMetadataAttribute = () => {
    let parsedMetadataObject = {...parsedMetadata}
    let trait_type_input = document.querySelector('#add_attribute_trait_type_input') as HTMLInputElement
    let trait_value_input = document.querySelector('#add_attribute_trait_value_input') as HTMLInputElement
    parsedMetadata.attributes.push({trait_type: trait_type_input?.value, value: trait_value_input?.value})
    trait_type_input.value = ''
    trait_value_input.value = ''
    console.log(parsedMetadata?.attributes)
    setParsedMetadata(parsedMetadataObject)
    console.log(parsedMetadata)
  }

  const updateMetadataFileArray = async () => {
    console.log("Current Parsed Data: " + parsedMetadata)
    console.log("Updating...")
    let metadataFileBlob = new Blob([JSON.stringify(parsedMetadata)], {
      type: 'application/json',
    })
    let updatedMetadataFile = new File(
      [metadataFileBlob],
      metadataFilesArray[metadataFileArrayIndex].name,
      { type: 'application/json' }
    )
    metadataFilesArray[metadataFileArrayIndex] = updatedMetadataFile
    console.log(JSON.parse(await metadataFilesArray[metadataFileArrayIndex]?.text()))
  }

  return (
    <div>
      <NextSeo title="Create Collection" />
      
      <div className="space-y-8 mt-5 text-center">
        <h1 className="font-heading text-4xl font-bold">
          Upload Assets & Metadata
        </h1>
        
        <p>
          Make sure you check our{' '}
          <Anchor
            href={links['Docs']}
            className="font-bold text-plumbus hover:underline"
          >
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="justify-items-start mt-5 mb-3 ml-3 flex-column">
        <div className="mt-3 ml-4 form-check form-check-inline">
          <input
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            type="radio"
            name="inlineRadioOptions2"
            id="inlineRadio2"
            value="Existing"
            onClick={() => {
              setUploadMethod('Existing')
            }}
            onChange={() => { }}
            checked={uploadMethod === 'Existing'}
          />
          <label
            className="inline-block text-white cursor-pointer form-check-label"
            htmlFor="inlineRadio2"
          >
            Use an existing URI
          </label>
        </div>
        <div className="mt-3 ml-4 form-check form-check-inline">
          <input
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio3"
            value="New"
            onClick={() => {
              setUploadMethod('New')
            }}
            onChange={() => { }}
            checked={uploadMethod === 'New'}
          />
          <label
            className="inline-block text-white cursor-pointer form-check-label"
            htmlFor="inlineRadio3"
          >
            Upload assets & metadata
          </label>
        </div>
      </div>

      <hr className="border-white/20" />

      {uploadMethod == 'Existing' && (
        <div className="ml-3 flex-column">
          <p className="my-3 ml-5">
            Though Stargaze&apos;s sg721 contract allows for off-chain metadata
            storage, it is recommended to use a decentralized storage solution,
            such as IPFS. <br /> You may head over to{' '}
            <Anchor
              href="https://nft.storage"
              className="font-bold text-plumbus hover:underline"
            >
              NFT Storage
            </Anchor>{' '}
            and upload your assets & metadata manually to get a base URI for
            your collection.
          </p>
          <div>
            <label className="block mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300">
              Collection Cover Image
            </label>
            <input
              onChange={handleChangeImage}
              placeholder="ipfs://bafybeigi3bwpvyvsmnbj46ra4hyffcxdeaj6ntfk5jpic5mx27x6ih2qvq/images/1.png"
              className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            />
          </div>
          <div>
            <label className="block mt-3 mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300">
              Base Token URI
            </label>
            <input
              onChange={handleChangeBaseTokenUri}
              placeholder="ipfs://..."
              className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            />
          </div>
        </div>
      )}
      {uploadMethod == 'New' && (
        <div>
          <div className= "grid grid-cols-2">
            <div className='w-full'>
              <label className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300">
                Image File Selection
              </label>
              <div
                className={clsx(
                  'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-full h-32',
                  'rounded border-2 border-white/20 border-dashed'
                )}
              >
                <input
                  id="imageFiles"
                  accept="image/*"
                  className={clsx(
                    'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                    'before:absolute before:inset-0 before:hover:bg-white/5 before:transition'
                  )}
                  onChange={selectImages}
                  ref={imageFilesRef}
                  type="file"
                  multiple
                />
              </div>

              <label className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300">
                Metadata Selection
              </label>
              <div
                className={clsx(
                  'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-full h-32',
                  'rounded border-2 border-white/20 border-dashed'
                )}
              >
                <input
                  id="metadataFiles"
                  accept=""
                  className={clsx(
                    'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                    'before:absolute before:inset-0 before:hover:bg-white/5 before:transition'
                  )}
                  onChange={selectMetadata}
                  ref={metadataFilesRef}
                  type="file"
                  multiple
                />
              </div>

              <div className="mt-5 ml-8">
                <Button
                  onClick={updateMetadata}
                  variant="solid"
                  isWide
                  className="w-[120px]"
                >
                  Upload
                </Button>
              </div>
          </div>

          <input type="checkbox" id="my-modal-4" className="modal-toggle" />
          <label htmlFor="my-modal-4" className="modal cursor-pointer">
            <label className="modal-box max-w-5xl max-h-fit absolute top-5 bottom-5 w-full" htmlFor="">
              <h3 className="text-lg font-bold">Metadata</h3>
              <div className='flex-row'>
                <label className="flex mt-2 mr-2 font-bold">Name</label>
                <input key={"name-input"} id="metadata_name" className="pt-2 rounded w-1/3" type={'text'} onBlur={()=>{updateMainMetadataValues()}} defaultValue={parsedMetadata ? parsedMetadata.name : ""}/>
              </div>
              <div className='my-1 flex-row'>
                <label className="flex mt-2 mr-2 font-bold">Description</label>
                <input key={"description-input"} id="metadata_description" className="pt-2 rounded w-3/4" type={'text'} onBlur={()=>{updateMainMetadataValues()}} defaultValue={parsedMetadata ? parsedMetadata.description : ""}  />
              </div>
              <div className='my-1 flex-row'>
                <label className="flex mt-2 mr-2 font-bold">External URL</label>
                <input key={"external-url-input"} id="metadata_external_url" className="pt-2 rounded w-3/4" type={'text'} onBlur={()=>{updateMainMetadataValues()}} defaultValue={parsedMetadata ? parsedMetadata.external_url : ""}  />
              </div>
              <div className='my-1 flex-row'>
                <label className="flex mt-2 mr-2 font-bold">Image</label>
                <input key={"image-input"} id="metadata_image" className="pt-2 rounded w-3/4" type={'text'} disabled defaultValue={parsedMetadata ? parsedMetadata.image : ""}  />
              </div>
              <p className="pt-4 font-bold">Attributes</p>
              <div className='grid grid-cols-3'>
                <div className="flex-row">
                <label className="flex mt-2 mr-2 font-bold">Trait Type</label> 
                </div>
                <div className="flex-row">
                <label className="flex mt-2 mr-2 font-bold">Value</label> 
                </div>
              </div>  
              {parsedMetadata && (parsedMetadata?.attributes.map((content: any, key: number) => (
              <div key={`attribute-${key}`} className='grid grid-cols-3'>
                <div key={`trait_type-${content.trait_type}`} className="flex-row">
                  <input key={`input-${content.trait_type}`} id={`attribute-trait-type-input-${key}`} className="pt-2 mb-2 rounded w-3/4" type={'text'} onBlur={()=>{updateMetadataAttributes(key)}} defaultValue={parsedMetadata ? content.trait_type : ""} />
                </div>
                <div key={`value-${content.value}`} className="flex-row">
                  <input key={`input-${content.name}`} id={`attribute-trait-value-input-${key}`} className="pt-2 mb-2 rounded w-3/4" type={'text'} onBlur={()=>{updateMetadataAttributes(key)}} defaultValue={parsedMetadata ? content.value : ""}  />
                </div>
                <div key={`button-${content.trait_type}`} className="flex-row">
                  <button key={`remove-${content.trait_type}`} className="flex-row mb-2 rounded w-1/4 border" onClick={(e)=>{e.preventDefault();removeMetadataAttribute(key);}}>Remove</button>
                </div>
              </div>  

              )))}
               <div className='grid grid-cols-3'>
                <div className="flex-row">
                  <input id="add_attribute_trait_type_input" className="pt-2 mb-2 rounded w-3/4" type={'text'} defaultValue= {""}  />
                </div>
                <div className="flex-row">
                  <input id="add_attribute_trait_value_input" className="pt-2 mb-2 rounded w-3/4" type={'text'} defaultValue={""}  />
                </div>
                <button className="flex-row mb-2 rounded w-1/4 border" onClick={()=>{addMetadataAttribute()}}>Add</button>
              </div>  
              
              <button onClick={()=>{updateMetadataFileArray()}} className='w-1/4 bg-blue border'>Update Metadata</button>
            
            </label>
          </label>
          
          <div className="ml-20 mr-10 mt-2 w-4/5 h-96 carousel carousel-vertical rounded-box border-dashed border-2">
            {imageFilesArray.length > 0 && (imageFilesArray.map((imageSource, index) => (
              <div className="carousel-item w-full h-1/8">
                <div className='grid grid-cols-4 col-auto'>
                <Conditional test={imageFilesArray[4*index] !== null}>
                <button key={4*index} onClick={()=>{parseMetadata(4*index)}} className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                  <label htmlFor="my-modal-4" className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                    <img key={4*index} className="my-1 px-1 thumbnail" src={imageFilesArray[4*index] ? URL.createObjectURL(imageFilesArray[4*index]):""} />
                  </label> 
                </button>
                </Conditional>
                <Conditional test={imageFilesArray.length > 4*index+1}>
                <button key={4*index+1} onClick={()=> {parseMetadata(4*index+1)}} className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                  <label htmlFor="my-modal-4" className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                    <img key={4*index+1} className="my-1 px-1 thumbnail" src={imageFilesArray[4*index+1] ? URL.createObjectURL(imageFilesArray[4*index+1]):""} />
                  </label>
                </button>
                </Conditional>
                <Conditional test={imageFilesArray.length > 4*index+2}>
                <button key={4*index+2} onClick={()=> {parseMetadata(4*index+2)}} className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                  <label htmlFor="my-modal-4" className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                    <img key={4*index+2} className="my-1 px-1 thumbnail" src={imageFilesArray[4*index+2] ? URL.createObjectURL(imageFilesArray[4*index+2]):""} />
                  </label>
                </button>
                </Conditional>
                <Conditional test={imageFilesArray.length > 4*index+3}>
                <button key={4*index+3} onClick={()=> {parseMetadata(4*index+3)}} className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                  <label htmlFor="my-modal-4" className="p-0 w-full h-full relative btn modal-button bg-transparent border-0 hover:bg-transparent">
                    <img key={4*index+3} className="my-1 px-1 thumbnail" src={imageFilesArray[4*index+3] ? URL.createObjectURL(imageFilesArray[4*index+3]):""} />
                  </label>
                </button>
                </Conditional>
              </div>
            </div> )))}
          </div>
          </div> 
          
        </div>
      )}
    </div>
  )
}

export default withMetadata(UploadPage, { center: false })
