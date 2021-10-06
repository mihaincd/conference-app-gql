const status = require('../../utils/constants')
const { randomCharacters } = require('../../utils/functions')

const conferenceResolvers = {
  Query: {
    conferenceList: async (_parent, { pager, filters }, { dataSources }, _info) => {
      const data = await dataSources.conferenceDb.getConferenceList(pager, filters)
      return data
    },
    conference: async (_parent, { id }, { dataSources }, _info) => {
      const data = await dataSources.conferenceDb.getConferenceByID(id)
      return data
    },
    joinedUsers: async (_parent, {id}, {dataSources}, _info) =>{
      const users = await dataSources.conferenceDb.getJoinedUsers(id)
      return users

    }
  },
  ConferenceList: {
    pagination: async (_parent, { pager, filters }, { dataSources }, _info) => {
      const { totalCount } = await dataSources.conferenceDb.getConferenceListTotalCount(filters)
      return { currentPage: pager, totalCount }
    }
    // ,
    // value:async(_parent,_params, _arguments,_info)=>{return}
  },
  Conference: {
    type: async ({ conferenceTypeId }, _params, { dataLoaders }, _info) => {
      const conferenceType = await dataLoaders.conferenceTypeById.load(conferenceTypeId)
      return conferenceType
    },
    category: async ({ categoryId }, _params, { dataLoaders }, _info) => {
      const category = await dataLoaders.categoryById.load(categoryId)
      return category
    },
    location: async ({ locationId }, _params, { dataLoaders }, _info) => {
      const location = await dataLoaders.locationById.load(locationId)
      return location
    },
    speakers: async ({ id }, _arguments, { dataLoaders }, _info) => {
      const speakers = await dataLoaders.speakersByConferenceId.load(id)
      return speakers
    },
    status: async ({ id }, { userEmail }, { dataLoaders }, _info) => {
      const status = await dataLoaders.statusByConferenceId.load({ id, userEmail })
      return status
    }
  },
  Location: {
    city: async ({ cityId }, _params, { dataLoaders }, _info) => {
      const city = await dataLoaders.cityById.load(cityId)
      return city
    },
    county: async ({ countyId }, _params, { dataLoaders }, _info) => {
      const county = await dataLoaders.countyById.load(countyId)
      return county
    },
    country: async ({ countryId }, _params, { dataLoaders }) => {
      const country = await dataLoaders.countryById.load(countryId)
      return country
    }
  },
  Mutation: {
    attend: async (_parent, { input }, { dataSources }, _info) => {
      const updateInput = { ...input, statusId: status.Attended }
      const statusID = await dataSources.conferenceDb.updateConferenceXAttendee(updateInput)
      const suggestedConferences = await dataSources.conferenceApi.getConferenceSuggestions(input)
      const code = statusID ? randomCharacters(10) : null

      return { suggestedConferences, code }
    },
    withdraw: async (_parent, { input }, { dataSources }, _info) => {
      const updateInput = { ...input, statusId: status.Withdrawn }
      const statusID = await dataSources.conferenceDb.updateConferenceXAttendee(updateInput)
      return statusID
    },
    join: async(_parent, { input }, { dataSources }, _info)=>{
      const updateInput = { ...input, statusId: status.Joined}
      const statusID = await dataSources.conferenceDb.updateConferenceXAttendee(updateInput)
      return statusID
    }
    ,
    saveConference: async (_parent, { input }, { dataSources }, _info) => {
      const location = await dataSources.conferenceDb.updateLocation(input.location)
      const updateConference = await dataSources.conferenceDb.updateConference({ ...input, location })
      const speakers = await Promise.all(
        input.speakers.map(async speaker => {
          const updateSpeaker = await dataSources.conferenceDb.updateSpeaker(speaker)
          const isMainSpeaker = await dataSources.conferenceDb.updateConferenceXSpeaker({
            speakerId: updateSpeaker.id,
            isMainSpeaker: speaker.isMainSpeaker,
            conferenceId: updateConference.id
          })
          return { ...updateSpeaker, isMainSpeaker }
        })
      )
      input?.deleteSpeakers?.length > 0 && (await dataSources.conferenceDb.deleteSpeakers(input.deleteSpeakers))
      return { ...updateConference, location, speakers }
    }
  }
}
module.exports = conferenceResolvers
