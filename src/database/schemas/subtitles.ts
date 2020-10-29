import * as mongoose from 'mongoose'

const SubtitlesSchema = new mongoose.Schema({
    link: String,
    name: String,
    username: String,
    language: String,
    totalDownloads: Number,
    rating: Number,
    sendedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    totalLikes: Number,
    likes: Number,
    dislikes: Number,
    likeRatio: Number,
    downloadLink: String
})

interface ISubtitles extends mongoose.Document {
    link: string,
    name: string,
    username: string,
    language: string,
    totalDownloads: number,
    rating: number,
    sendedAt: number,
    createdAt: Date,
    updatedAt: Date,
    totalLikes: number,
    likes: number,
    dislikes: number,
    likeRatio: number,
    downloadLink: string
}

export const SubtitleModel = mongoose.model<ISubtitles>("subtitles", SubtitlesSchema)
