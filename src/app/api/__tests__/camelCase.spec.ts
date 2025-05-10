import { underscoreJsonToCamelCase } from "../camelCase"

describe('camelCase tests', () => {
  test("It converts underscores to camelCase in object keys", () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
      age_years: 30
    }

    const expectedOutput = {
      firstName: 'John',
      lastName: 'Doe',
      ageYears: 30
    }

    const result = underscoreJsonToCamelCase(input)

    expect(result).toEqual(expectedOutput)
  })

  test("It converts nested objects and items in arrays to camelCase", () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
      age_years: 30,
      address: {
        street_name: 'Main St',
        city_name: 'Anytown'
      },
      hobbies: [
        { hobby_name: 'reading' },
        { hobby_name: 'gaming' }
      ]
    }

    const expectedOutput = {
      firstName: 'John',
      lastName: 'Doe',
      ageYears: 30,
      address: {
        streetName: 'Main St',
        cityName: 'Anytown'
      },
      hobbies: [
        { hobbyName: 'reading' },
        { hobbyName: 'gaming' }
      ]
    }

    const result = underscoreJsonToCamelCase(input)

    expect(result).toEqual(expectedOutput)
  })

  test("It leaves array values alone", () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
      age_years: 30,
      hobbies: ['reading_my_dog', 'gaming_a_lot']
    }

    const expectedOutput = {
      firstName: 'John',
      lastName: 'Doe',
      ageYears: 30,
      hobbies: ['reading_my_dog', 'gaming_a_lot']
    }

    const result = underscoreJsonToCamelCase(input)

    expect(result).toEqual(expectedOutput)
  })
})
