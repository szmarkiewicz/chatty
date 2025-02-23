import {useCallback} from "react";
import {AudioTypes, ImageTypes, VideoTypes} from "../../models";
import DownloadSvg from "../../assets/download.svg";
import FileSvg from "../../assets/file.svg";
import {BASE_URL} from "../../services/utils.ts";
import {FadeLoader} from "react-spinners";
import "./index.css";

export type FileProps = {
    mediaKey: string | null;
    filename: string | null;
    type: string | null;
    size: number | null;
    previewOnly: boolean;
}

export default function File({mediaKey, filename, type, size, previewOnly = false}: FileProps) {
    const constructedUrl = BASE_URL + '/media/' + mediaKey;

    const getFileContainerByType = useCallback(() => {
        if (type) {
            if (Object.values(ImageTypes).includes(type)) {
                return <img src={constructedUrl} alt={filename ?? "Image File"} className={'file-image'}
                            crossOrigin={'use-credentials'}
                            width={100} height={100}/>
            }
            if (Object.values(AudioTypes).includes(type)) {
                return <audio controls src={constructedUrl} className={'file-audio'} crossOrigin={'use-credentials'}/>
            }
            if (Object.values(VideoTypes).includes(type)) {
                return <video controls src={constructedUrl} className={'file-video'} crossOrigin={'use-credentials'}/>
            }
        }

        return <img src={FileSvg} alt={filename ?? "Image File"} className={'file'}
                    crossOrigin={'use-credentials'}/>
    }, [constructedUrl, type, filename]);

    return <div className={`file-container ${previewOnly ? "preview-only" : ""}`}>
        {mediaKey !== null ? getFileContainerByType() : <FadeLoader/>}
        <div className={'file-info'}>
            {!previewOnly ? <span className={'filename'}>{filename}<br/>{size} B</span> : null}
            <a href={constructedUrl} className={'download-file'}><img src={DownloadSvg} alt={`Download ${filename}`}
                                                                      width={32} height={32}/></a>
        </div>
    </div>
}