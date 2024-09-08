import axios, { AxiosInstance, AxiosError } from 'axios'

type BaseRoutes = Record<
  string,
  {
    req?: {
      params?: any
      body?: any
      query?: any
      headers?: Record<string, any>
    }
    res?: any
  }
>

const useRestClient = <T extends BaseRoutes>(
  axiosInstance: AxiosInstance,
  errorRequestHandler: (arg: AxiosError) => void = (e) => console.error(e)
) => {
  const rest = <K extends keyof T>(routeName: K) => {
    type RouteReq = T[K]['req']
    type RouteRes = T[K]['res']

    const fn = (async (options?: any) => {
      const [method, url] = (routeName as string).split(' ')

      try {
        const res = await axiosInstance.request({
          method,
          url: url.replace(/:(\w+)/g, (_, key) => options?.params[key]),
          params: options?.query,
          data: options?.body,
          headers: options?.headers,
        })
        return res.data
      } catch (e) {
        if (errorRequestHandler) {
          errorRequestHandler(e as AxiosError)
          return
        }
        throw e
      }
    }) as undefined extends RouteReq
      ? () => Promise<RouteRes>
      : (
          options: Omit<RouteReq, 'headers'> & {
            headers?: Record<string, any>
          }
        ) => Promise<RouteRes>
    return fn
  }

  return { rest }
}

export { axios }
export { useRestClient }
