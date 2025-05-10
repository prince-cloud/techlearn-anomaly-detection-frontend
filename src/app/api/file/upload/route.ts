import { NextRequest, NextResponse } from "next/server"
import { apiUpload, getAccessToken } from "../../common"
import { AcceptedMimeTypes } from ".."

export async function POST(req: NextRequest) {
  const accessToken = await getAccessToken(req)
  const formData = await req.formData()

  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({
      message: "File not found in request"
    }, {
      status: 400
    })
  }

  const acceptedFileExtensions = Object.keys(AcceptedMimeTypes)
  const acceptedMimeTypes = Object.values(AcceptedMimeTypes)

  const mimeTypeIndex = acceptedMimeTypes.indexOf(file.type as AcceptedMimeTypes)

  if (mimeTypeIndex === -1) {
    return NextResponse.json({
      message: `File type not supported. Accepted types: ${acceptedFileExtensions.join(', ')}`
    }, {
      status: 400
    })
  }

  const fileExt = acceptedFileExtensions[mimeTypeIndex]

  formData.set('file_format', `.${fileExt}`)

  const response = await apiUpload(req, '/core/file-validation/file-upload/', formData, accessToken)

  if (!response) {
    return NextResponse.json({
      message: "Cannot upload file"
    }, {
      status: 500
    })
  }

  return NextResponse.json({
    id: response.data.data.report_file.id
  })
}
